package com.harithafashion.service;

import com.harithafashion.entity.AbandonedCart;
import com.harithafashion.entity.Cart;
import com.harithafashion.entity.User;
import com.harithafashion.repository.AbandonedCartRepository;
import com.harithafashion.repository.CartRepository;
import com.harithafashion.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AbandonedCartService {

    private final CartRepository cartRepository;
    private final AbandonedCartRepository abandonedCartRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void checkAbandonedCarts() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<Cart> stale = cartRepository.findStaleCartsWithItems(oneHourAgo);
        for (Cart cart : stale) {
            if (cart.getUser() == null || cart.getItems().isEmpty()) continue;
            if (orderRepository.existsByUserId(cart.getUser().getId())) continue;
            AbandonedCart ac = abandonedCartRepository.findByUserId(cart.getUser().getId())
                    .orElse(AbandonedCart.builder().user(cart.getUser()).build());
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
        if (user.getEmail() != null) emailService.sendAbandonedCartEmail(user.getEmail(), user.getName());
        if (user.getMobile() != null) whatsAppService.sendOrderConfirmation(user.getMobile(), "CART", "0", "Complete checkout");
    }
}
