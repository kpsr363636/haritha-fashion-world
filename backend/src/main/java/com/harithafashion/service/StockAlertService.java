package com.harithafashion.service;

import com.harithafashion.entity.Product;
import com.harithafashion.entity.ProductImage;
import com.harithafashion.entity.StockAlert;
import com.harithafashion.entity.User;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockAlertService {

    private final StockAlertRepository stockAlertRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final EmailService emailService;

    @Transactional
    public void subscribe(UUID userId, UUID variantId) {
        User user = userRepository.findById(userId).orElseThrow();
        var variant = variantRepository.findById(variantId).orElseThrow();
        if (stockAlertRepository.existsByUserIdAndVariantId(userId, variantId)) return;
        stockAlertRepository.save(StockAlert.builder()
                .user(user).product(variant.getProduct()).variant(variant).notified(false).build());
    }

    @Transactional
    public void notifyBackInStock(UUID variantId) {
        stockAlertRepository.findByVariantIdAndNotifiedFalse(variantId).forEach(alert -> {
            User user = alert.getUser();
            if (user.getEmail() != null) {
                emailService.sendBackInStockEmail(user.getEmail(), user.getName(), alert.getProduct().getName());
            }
            alert.setNotified(true);
            stockAlertRepository.save(alert);
        });
    }
}
