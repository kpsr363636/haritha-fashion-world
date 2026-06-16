package com.harithafashion.service;

import com.harithafashion.entity.Referral;
import com.harithafashion.entity.User;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.repository.ReferralRepository;
import com.harithafashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public Map<String, Object> getMyReferral(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Referral> refs = referralRepository.findByReferrerIdOrderByCreatedAtDesc(userId);
        long credited = refs.stream().filter(r -> "CREDITED".equals(r.getStatus())).count();
        return Map.of(
                "referralCode", user.getReferralCode(),
                "link", frontendUrl + "/register?ref=" + user.getReferralCode(),
                "totalReferrals", refs.size(),
                "credited", credited,
                "pending", refs.size() - credited);
    }

    @Transactional
    public void creditOnFirstDelivery(UUID refereeId) {
        referralRepository.findByRefereeId(refereeId).ifPresent(ref -> {
            if ("CREDITED".equals(ref.getStatus())) return;
            long delivered = orderRepository.countByUserIdAndStatus(refereeId, OrderStatus.DELIVERED);
            if (delivered > 0) {
                ref.setStatus("CREDITED");
                ref.setCreditedAt(LocalDateTime.now());
                referralRepository.save(ref);
                User referrer = ref.getReferrer();
                referrer.setLoyaltyPoints(referrer.getLoyaltyPoints() + 100);
                userRepository.save(referrer);
                if (referrer.getEmail() != null) {
                    emailService.sendReferralCreditedEmail(referrer.getEmail(), referrer.getName(), 100);
                }
            }
        });
    }
}
