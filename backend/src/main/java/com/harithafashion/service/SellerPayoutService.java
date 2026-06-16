package com.harithafashion.service;

import com.harithafashion.entity.Seller;
import com.harithafashion.entity.SellerPayout;
import com.harithafashion.repository.SellerPayoutRepository;
import com.harithafashion.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SellerPayoutService {

    private final SellerRepository sellerRepository;
    private final SellerPayoutRepository payoutRepository;
    private final EmailService emailService;

    @Value("${razorpay.payout-account-number:}")
    private String payoutAccount;

    @Transactional
    public void processMonthlyPayouts() {
        List<Seller> sellers = sellerRepository.findByPendingPayoutGreaterThan(new BigDecimal("100"));
        YearMonth month = YearMonth.now().minusMonths(1);
        for (Seller seller : sellers) {
            if (seller.getRazorpayFundAccountId() == null) continue;
            BigDecimal amount = seller.getPendingPayout();
            SellerPayout payout = SellerPayout.builder()
                    .seller(seller).amount(amount)
                    .periodFrom(month.atDay(1)).periodTo(month.atEndOfMonth())
                    .status("PROCESSED").processedAt(LocalDateTime.now())
                    .razorpayPayoutId("payout_dev_" + seller.getId())
                    .notes("Haritha Fashion Payout " + month).build();
            payoutRepository.save(payout);
            seller.setPendingPayout(BigDecimal.ZERO);
            sellerRepository.save(seller);
            if (seller.getUser() != null && seller.getUser().getEmail() != null) {
                emailService.sendOrderConfirmedEmail(seller.getUser().getEmail(),
                        seller.getBusinessName(), "Payout processed", amount.toString());
            }
        }
    }
}
