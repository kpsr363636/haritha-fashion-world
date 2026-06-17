package com.harithafashion.scheduler;

import com.harithafashion.entity.LoyaltyTransaction;
import com.harithafashion.entity.Order;
import com.harithafashion.entity.Seller;
import com.harithafashion.entity.Shipment;
import com.harithafashion.repository.*;
import com.harithafashion.service.EmailService;
import com.harithafashion.service.ShipmentService;
import com.harithafashion.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class MissingSchedulers {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final SellerRepository sellerRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final EmailService emailService;
    private final ShipmentService shipmentService;
    private final StockAlertService stockAlertService;
    private final StringRedisTemplate redisTemplate;

    @Value("${shiprocket.email:}")
    private String shiprocketEmail;

    @Value("${shiprocket.password:}")
    private String shiprocketPassword;

    // ─── JOB 11: Shiprocket token refresh every 23 hours ───────────────────────
    @Scheduled(fixedDelay = 82_800_000)
    public void refreshShiprocketToken() {
        if (shiprocketEmail == null || shiprocketEmail.isBlank()) return;
        try {
            Map<?, ?> resp = WebClient.create("https://apiv2.shiprocket.in")
                    .post().uri("/v1/external/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("email", shiprocketEmail, "password", shiprocketPassword))
                    .retrieve().bodyToMono(Map.class).block();
            if (resp != null && resp.get("token") != null) {
                redisTemplate.opsForValue().set("SHIPROCKET_TOKEN", (String) resp.get("token"),
                        23, TimeUnit.HOURS);
                log.info("Shiprocket token refreshed");
            }
        } catch (Exception e) {
            log.error("Shiprocket token refresh failed: {}", e.getMessage());
        }
    }

    // ─── JOB 12: Hourly shipment status sync ───────────────────────────────────
    @Scheduled(fixedDelay = 3_600_000)
    public void syncShipmentStatuses() {
        List<Shipment> activeShipments = shipmentRepository.findByStatusIn(
                List.of("CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"));
        for (Shipment s : activeShipments) {
            if (s.getAwbNumber() == null) continue;
            try {
                shipmentService.trackShipment(s.getAwbNumber());
            } catch (Exception e) {
                log.debug("Tracking sync failed for AWB {}: {}", s.getAwbNumber(), e.getMessage());
            }
        }
        log.info("Shipment status sync completed for {} shipments", activeShipments.size());
    }

    // ─── JOB 13: Seller performance recalculation daily 2am ────────────────────
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void recalculateSellerPerformance() {
        List<Seller> sellers = sellerRepository.findAll();
        for (Seller seller : sellers) {
            try {
                // Recalculate avg rating from reviews
                Double avgRating = reviewRepository.findAverageRatingBySellerId(seller.getId());
                if (avgRating != null) {
                    seller.setAvgRating(BigDecimal.valueOf(avgRating));
                }
                // Recalculate fulfillment rate: delivered / (delivered + cancelled) last 90 days
                LocalDateTime since = LocalDateTime.now().minusDays(90);
                long delivered = orderRepository.countDeliveredBySellerId(seller.getId(), since);
                long cancelled = orderRepository.countCancelledBySellerId(seller.getId(), since);
                long total = delivered + cancelled;
                if (total > 0) {
                    BigDecimal rate = BigDecimal.valueOf((double) delivered / total * 100)
                            .setScale(2, java.math.RoundingMode.HALF_UP);
                    seller.setFulfillmentRate(rate);
                }
                sellerRepository.save(seller);
            } catch (Exception e) {
                log.error("Performance recalc failed for seller {}: {}", seller.getId(), e.getMessage());
            }
        }
        log.info("Seller performance recalculation done for {} sellers", sellers.size());
    }

    // ─── JOB 9: Loyalty points expiry daily midnight ────────────────────────────
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireLoyaltyPoints() {
        LocalDateTime now = LocalDateTime.now();
        List<LoyaltyTransaction> expired = loyaltyTransactionRepository
                .findExpiredEarnTransactions(now.toLocalDate());
        for (LoyaltyTransaction tx : expired) {
            try {
                int pts = tx.getPoints();
                // Record expiry transaction
                loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                        .user(tx.getUser())
                        .points(-pts)
                        .type("EXPIRE")
                        .description("Points expired (earned " + tx.getCreatedAt().toLocalDate() + ")")
                        .build());
                // Deduct from user
                tx.getUser().setLoyaltyPoints(
                        Math.max(0, tx.getUser().getLoyaltyPoints() - pts));
                userRepository.save(tx.getUser());
                // Mark original transaction as expired
                tx.setExpired(true);
                loyaltyTransactionRepository.save(tx);
                // Notify user
                if (tx.getUser().getEmail() != null) {
                    emailService.sendLoyaltyPointsExpiredEmail(
                            tx.getUser().getEmail(), tx.getUser().getName(), pts);
                }
            } catch (Exception e) {
                log.error("Loyalty expiry failed for tx {}: {}", tx.getId(), e.getMessage());
            }
        }
        if (!expired.isEmpty()) {
            log.info("Expired loyalty points for {} transactions", expired.size());
        }
    }

    // ─── JOB 6+7: Low stock alerts + auto-delist daily 8am ─────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    public void stockAlertsAndAutoDelist() {
        stockAlertService.sendLowStockAlerts();
        stockAlertService.autoDelistZeroStockProducts();
    }

    // ─── JOB 14: Retry failed shipments every 30 min ───────────────────────────
    @Scheduled(fixedDelay = 1_800_000)
    public void retryFailedShipments() {
        List<Order> ordersWithoutShipment = orderRepository.findPaidOrdersWithoutShipment();
        for (Order order : ordersWithoutShipment) {
            try {
                shipmentService.createShipment(order.getId());
                log.info("Retry shipment created for order {}", order.getOrderNumber());
            } catch (Exception e) {
                log.debug("Shipment retry failed for order {}: {}", order.getOrderNumber(), e.getMessage());
            }
        }
    }
}
