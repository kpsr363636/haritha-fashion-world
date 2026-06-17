package com.harithafashion.service;

import com.harithafashion.entity.AbandonedCart;
import com.harithafashion.entity.Cart;
import com.harithafashion.entity.NotificationPreference;
import com.harithafashion.entity.User;
import com.harithafashion.repository.AbandonedCartRepository;
import com.harithafashion.repository.CartRepository;
import com.harithafashion.repository.NotificationPreferenceRepository;
import com.harithafashion.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AbandonedCartService {

    private final CartRepository cartRepository;
    private final AbandonedCartRepository abandonedCartRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final NotificationPreferenceRepository notificationPreferenceRepository;

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void checkAbandonedCarts() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<Cart> stale = cartRepository.findStaleCartsWithItems(oneHourAgo);
        for (Cart cart : stale) {
            if (cart.getUser() == null || cart.getItems().isEmpty()) continue;
            UUID userId = cart.getUser().getId();

            // Only skip if the user placed an order in the last 7 days (not ever)
            boolean hasRecentOrder = orderRepository.existsByUserIdAndPlacedAtAfter(
                    userId, LocalDateTime.now().minusDays(7));
            if (hasRecentOrder) continue;

            AbandonedCart ac = abandonedCartRepository.findByUserId(userId)
                    .orElse(AbandonedCart.builder().user(cart.getUser()).build());

            // Reset reminder flags when cart is updated after last abandonment record
            if (ac.getAbandonedAt() == null ||
                    (cart.getUpdatedAt() != null && cart.getUpdatedAt().isAfter(ac.getAbandonedAt()))) {
                ac.setReminder1hSent(false);
                ac.setReminder24hSent(false);
            }

            ac.setCartSnapshot(Map.of("itemCount", cart.getItems().size()));
            ac.setAbandonedAt(LocalDateTime.now());

            if (!Boolean.TRUE.equals(ac.getReminder1hSent())) {
                notifyUser(cart.getUser(), "1h");
                ac.setReminder1hSent(true);
            } else if (!Boolean.TRUE.equals(ac.getReminder24hSent())
                    && ac.getAbandonedAt().isBefore(LocalDateTime.now().minusHours(23))) {
                notifyUser(cart.getUser(), "24h");
                ac.setReminder24hSent(true);
            }
            abandonedCartRepository.save(ac);
        }
    }

    private void notifyUser(User user, String type) {
        NotificationPreference prefs = notificationPreferenceRepository.findByUserId(user.getId())
                .orElse(NotificationPreference.builder().build());

        if (Boolean.TRUE.equals(prefs.getOrderUpdatesEmail()) && user.getEmail() != null) {
            emailService.sendAbandonedCartEmail(user.getEmail(), user.getName() != null ? user.getName() : "there");
        }
        if (Boolean.TRUE.equals(prefs.getOrderUpdatesWhatsapp()) && user.getMobile() != null) {
            whatsAppService.sendOrderConfirmation(user.getMobile(), "CART", "0", "Complete your checkout");
        }
        log.debug("Abandoned cart reminder ({}) sent to user {}", type, user.getId());
    }
}
