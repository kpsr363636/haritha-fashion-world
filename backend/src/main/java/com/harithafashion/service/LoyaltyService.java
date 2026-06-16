package com.harithafashion.service;

import com.harithafashion.entity.LoyaltyTransaction;
import com.harithafashion.entity.Order;
import com.harithafashion.entity.User;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void awardForOrder(Order order) {
        if (order.getLoyaltyPointsEarned() == null || order.getLoyaltyPointsEarned() <= 0) return;
        User user = order.getUser();
        loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                .user(user).order(order).points(order.getLoyaltyPointsEarned())
                .type("EARNED").description("Order " + order.getOrderNumber())
                .expiresAt(LocalDate.now().plusYears(1)).build());
        updateTier(user);
    }

    @Transactional
    public void deductForOrderCancel(Order order) {
        if (order.getLoyaltyPointsEarned() == null || order.getLoyaltyPointsEarned() <= 0) return;
        User user = order.getUser();
        user.setLoyaltyPoints(Math.max(0, user.getLoyaltyPoints() - order.getLoyaltyPointsEarned()));
        loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                .user(user).order(order).points(-order.getLoyaltyPointsEarned())
                .type("DEDUCTED").description("Cancelled order " + order.getOrderNumber()).build());
        userRepository.save(user);
    }

    public int pointsToDiscount(int points) {
        return points / 10;
    }

    public Page<LoyaltyTransaction> getTransactions(UUID userId, int page, int size) {
        return loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public Map<String, Object> getSummary(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Map<String, Object> m = new HashMap<>();
        m.put("points", user.getLoyaltyPoints());
        m.put("tier", user.getLoyaltyTier());
        return m;
    }

    private void updateTier(User user) {
        int pts = user.getLoyaltyPoints();
        if (pts >= 5000) user.setLoyaltyTier("PLATINUM");
        else if (pts >= 2000) user.setLoyaltyTier("GOLD");
        else user.setLoyaltyTier("SILVER");
        userRepository.save(user);
    }
}
