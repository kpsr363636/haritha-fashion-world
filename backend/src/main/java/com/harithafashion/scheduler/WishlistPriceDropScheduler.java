package com.harithafashion.scheduler;

import com.harithafashion.repository.WishlistItemRepository;
import com.harithafashion.service.EmailService;
import com.harithafashion.service.SellerPayoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WishlistPriceDropScheduler {

    private final WishlistItemRepository wishlistItemRepository;
    private final EmailService emailService;

    @Value("${scheduler.wishlist-price-drop.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "0 0 10 * * *")
    public void checkPriceDrops() {
        if (!enabled) return;
        wishlistItemRepository.findAll().forEach(item -> {
            if (item.getProduct() == null || item.getPriceAtAdd() == null) return;
            var current = item.getProduct().getBasePrice();
            if (current.compareTo(item.getPriceAtAdd().multiply(new java.math.BigDecimal("0.90"))) < 0) {
                var user = item.getWishlist().getUser();
                if (user.getEmail() != null) {
                    emailService.sendPriceDropEmail(user.getEmail(), user.getName(),
                            item.getProduct().getName(), current.toString());
                }
            }
        });
    }
}

@Component
@RequiredArgsConstructor
@Slf4j
class SellerPayoutScheduler {

    private final SellerPayoutService sellerPayoutService;

    @Value("${scheduler.seller-payouts.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "0 0 9 1 * *")
    public void runMonthlyPayouts() {
        if (!enabled) return;
        sellerPayoutService.processMonthlyPayouts();
    }
}
