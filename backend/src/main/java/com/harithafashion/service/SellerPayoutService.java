package com.harithafashion.service;

import com.harithafashion.entity.Seller;
import com.harithafashion.entity.SellerPayout;
import com.harithafashion.repository.SellerPayoutRepository;
import com.harithafashion.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SellerPayoutService {

    private final SellerRepository sellerRepository;
    private final SellerPayoutRepository payoutRepository;
    private final EmailService emailService;

    @Value("${razorpay.payout-account-number:}")
    private String payoutAccount;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Transactional
    public void processMonthlyPayouts() {
        List<Seller> sellers = sellerRepository.findByPendingPayoutGreaterThan(new BigDecimal("100"));
        YearMonth month = YearMonth.now().minusMonths(1);
        String monthLabel = month.format(DateTimeFormatter.ofPattern("MMM yyyy"));
        for (Seller seller : sellers) {
            if (seller.getRazorpayFundAccountId() == null) continue;
            BigDecimal amount = seller.getPendingPayout();
            String payoutId = initiateRazorpayPayout(seller, amount, monthLabel);
            String status = payoutId != null ? "PROCESSING" : "FAILED";
            SellerPayout payout = SellerPayout.builder()
                    .seller(seller).amount(amount)
                    .periodFrom(month.atDay(1)).periodTo(month.atEndOfMonth())
                    .status(status).processedAt(LocalDateTime.now())
                    .razorpayPayoutId(payoutId != null ? payoutId : "failed_" + seller.getId())
                    .notes("Haritha Fashion Payout " + monthLabel).build();
            payoutRepository.save(payout);
            if (payoutId != null) {
                seller.setPendingPayout(BigDecimal.ZERO);
                sellerRepository.save(seller);
            }
            if (seller.getUser() != null && seller.getUser().getEmail() != null) {
                emailService.sendSellerPayoutEmail(seller.getUser().getEmail(),
                        seller.getBusinessName(), amount);
            }
        }
        log.info("Monthly payouts processed for {} sellers", sellers.size());
    }

    @SuppressWarnings("unchecked")
    private String initiateRazorpayPayout(Seller seller, BigDecimal amount, String monthLabel) {
        if (razorpayKeyId.isBlank() || payoutAccount.isBlank()) {
            log.warn("Razorpay payout keys not configured — skipping live payout for seller {}", seller.getId());
            return "payout_dev_" + seller.getId();
        }
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("account_number", payoutAccount);
            body.put("fund_account_id", seller.getRazorpayFundAccountId());
            body.put("amount", amount.multiply(new BigDecimal("100")).longValue()); // paise
            body.put("currency", "INR");
            body.put("mode", "NEFT");
            body.put("purpose", "payout");
            body.put("narration", "Haritha Fashion Payout " + monthLabel);
            body.put("reference_id", "HF-PAYOUT-" + seller.getId().toString().substring(0, 8)
                    + "-" + monthLabel.replace(" ", ""));
            Map<String, Object> resp = WebClient.builder()
                    .baseUrl("https://api.razorpay.com/v1")
                    .defaultHeaders(h -> h.setBasicAuth(razorpayKeyId, razorpayKeySecret))
                    .build()
                    .post().uri("/payouts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve().bodyToMono(Map.class).block();
            if (resp != null && resp.get("id") != null) {
                log.info("Razorpay payout {} initiated for seller {}", resp.get("id"), seller.getId());
                return (String) resp.get("id");
            }
        } catch (Exception e) {
            log.error("Razorpay payout failed for seller {}: {}", seller.getId(), e.getMessage());
        }
        return null;
    }
}
