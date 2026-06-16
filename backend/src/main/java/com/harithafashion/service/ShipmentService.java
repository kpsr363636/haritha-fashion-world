package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.repository.OrderItemRepository;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final WhatsAppService whatsAppService;
    private final ReferralService referralService;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;

    @Value("${shiprocket.base-url}")
    private String baseUrl;

    @Value("${shiprocket.email:}")
    private String shiprocketEmail;

    @Value("${shiprocket.password:}")
    private String shiprocketPassword;

    @Value("${shiprocket.pickup-location:Primary}")
    private String pickupLocation;

    private static final String TOKEN_CACHE_KEY = "shiprocket:token";

    // ---------------------------------------------------------------
    // FORWARD LOGISTICS
    // ---------------------------------------------------------------

    @Async
    @Transactional
    public void createShipment(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        if (items.isEmpty()) return;

        String awb;
        String courierName;
        String trackingUrl;
        String srOrderId;

        if (isConfigured()) {
            try {
                String token = getOrRefreshToken();
                Map<String, Object> srOrder = createShiprocketOrder(token, order, items);
                srOrderId = String.valueOf(srOrder.getOrDefault("order_id", ""));
                Map<String, Object> assigned = assignCourier(token, srOrderId);
                awb = String.valueOf(assigned.getOrDefault("awb_code", "SR" + System.currentTimeMillis()));
                courierName = String.valueOf(assigned.getOrDefault("courier_name", "Delhivery"));
                trackingUrl = "https://track.shiprocket.in/tracking/" + awb;
            } catch (Exception e) {
                log.warn("Shiprocket API failed, using fallback AWB: {}", e.getMessage());
                awb = "SR" + System.currentTimeMillis();
                courierName = "Delhivery";
                trackingUrl = "https://track.shiprocket.in/tracking/" + awb;
                srOrderId = "SR-ORD-" + order.getOrderNumber();
            }
        } else {
            awb = "SR" + System.currentTimeMillis();
            courierName = "Delhivery (dev)";
            trackingUrl = "https://track.shiprocket.in/tracking/" + awb;
            srOrderId = "SR-ORD-DEV-" + order.getOrderNumber();
        }

        for (OrderItem item : items) {
            Shipment shipment = Shipment.builder()
                    .order(order)
                    .orderItem(item)
                    .shiprocketOrderId(srOrderId)
                    .shiprocketShipmentId(srOrderId)
                    .awbNumber(awb)
                    .courierName(courierName)
                    .trackingUrl(trackingUrl)
                    .status("SHIPPED")
                    .estimatedDelivery(LocalDate.now().plusDays(4))
                    .shippedAt(java.time.LocalDateTime.now())
                    .build();
            shipmentRepository.save(shipment);
            item.setStatus(OrderStatus.SHIPPED);
            orderItemRepository.save(item);
        }

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        notifyShipped(order, courierName, awb, trackingUrl);
    }

    // ---------------------------------------------------------------
    // REVERSE LOGISTICS (returns)
    // ---------------------------------------------------------------

    @Transactional
    public String scheduleReversePickup(ReturnRequest req) {
        if (!isConfigured()) {
            String reverseAwb = "REV" + System.currentTimeMillis();
            req.setReverseAwb(reverseAwb);
            req.setReverseShiprocketOrderId("REV-DEV-" + req.getId());
            return reverseAwb;
        }
        try {
            String token = getOrRefreshToken();
            Order order = req.getOrder();
            Map<String, Object> payload = Map.of(
                    "order_id", order.getOrderNumber() + "-RET",
                    "order_date", order.getPlacedAt().toLocalDate().toString(),
                    "channel_id", "",
                    "billing_customer_name", getSnap(order, "fullName"),
                    "billing_address", getSnap(order, "addressLine"),
                    "billing_city", getSnap(order, "city"),
                    "billing_state", getSnap(order, "state"),
                    "billing_country", "India",
                    "billing_pincode", getSnap(order, "pincode"),
                    "billing_email", order.getUser().getEmail() != null ? order.getUser().getEmail() : "",
                    "billing_phone", getSnap(order, "mobile"),
                    "pickup_customer_name", "Haritha Fashion World",
                    "pickup_address", pickupLocation,
                    "pickup_city", "Hyderabad",
                    "pickup_state", "Telangana",
                    "pickup_country", "India",
                    "pickup_pincode", "500001",
                    "pickup_email", shiprocketEmail,
                    "pickup_phone", "9000000000",
                    "order_items", List.of(Map.of(
                            "name", req.getOrderItem() != null ? req.getOrderItem().getProductName() : "Product",
                            "sku", "RETURN",
                            "units", 1,
                            "selling_price", req.getOrderItem() != null ? req.getOrderItem().getUnitPrice() : 0)),
                    "payment_method", "Prepaid",
                    "sub_total", req.getOrderItem() != null ? req.getOrderItem().getTotalPrice() : 0,
                    "length", 10, "breadth", 10, "height", 10, "weight", 0.3);

            @SuppressWarnings("unchecked")
            Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                    .post().uri("/orders/create/return")
                    .header("Authorization", "Bearer " + token)
                    .bodyValue(payload)
                    .retrieve().bodyToMono(Map.class)
                    .block(Duration.ofSeconds(15));

            String awb = resp != null ? String.valueOf(resp.getOrDefault("awb_code", "REV" + System.currentTimeMillis())) : "REV" + System.currentTimeMillis();
            String srId = resp != null ? String.valueOf(resp.getOrDefault("order_id", req.getId())) : String.valueOf(req.getId());
            req.setReverseAwb(awb);
            req.setReverseShiprocketOrderId(srId);
            return awb;
        } catch (Exception e) {
            log.error("Reverse pickup failed for return {}: {}", req.getId(), e.getMessage());
            String awb = "REV" + System.currentTimeMillis();
            req.setReverseAwb(awb);
            req.setReverseShiprocketOrderId("REV-FAIL-" + req.getId());
            return awb;
        }
    }

    // ---------------------------------------------------------------
    // TRACKING
    // ---------------------------------------------------------------

    public Map<String, Object> trackShipment(String awb) {
        if (!isConfigured() || awb == null || awb.startsWith("SR") || awb.startsWith("REV")) {
            return Map.of("current_status", "In Transit", "awb_code", awb,
                    "scans", List.of(Map.of("date", LocalDate.now().toString(), "activity", "Shipment created")));
        }
        try {
            String token = getOrRefreshToken();
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                    .get().uri("/courier/track/awb/" + awb)
                    .header("Authorization", "Bearer " + token)
                    .retrieve().bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));
            return resp != null ? resp : Map.of("current_status", "Unknown");
        } catch (Exception e) {
            log.warn("Tracking failed for AWB {}: {}", awb, e.getMessage());
            return Map.of("current_status", "In Transit", "awb_code", awb);
        }
    }

    // ---------------------------------------------------------------
    // SERVICEABILITY
    // ---------------------------------------------------------------

    public Map<String, Object> checkServiceability(String pincode) {
        if (!isConfigured()) {
            return Map.of("serviceable", true, "estimatedDays", 3, "couriers", List.of("Delhivery", "BlueDart"));
        }
        try {
            String token = getOrRefreshToken();
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                    .get().uri(u -> u.path("/courier/serviceability")
                            .queryParam("pickup_postcode", "500001")
                            .queryParam("delivery_postcode", pincode)
                            .queryParam("weight", 0.5)
                            .queryParam("cod", 1)
                            .build())
                    .header("Authorization", "Bearer " + token)
                    .retrieve().bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));
            return resp != null ? resp : Map.of("serviceable", true, "estimatedDays", 3);
        } catch (Exception e) {
            log.warn("Serviceability check failed for {}: {}", pincode, e.getMessage());
            return Map.of("serviceable", true, "estimatedDays", 3);
        }
    }

    // ---------------------------------------------------------------
    // DELIVERED
    // ---------------------------------------------------------------

    @Transactional
    public void markDelivered(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
        orderItemRepository.findByOrderId(orderId).forEach(item -> {
            item.setStatus(OrderStatus.DELIVERED);
            orderItemRepository.save(item);
        });
        shipmentRepository.findByOrderId(orderId).forEach(s -> {
            s.setStatus("DELIVERED");
            s.setDeliveredAt(java.time.LocalDateTime.now());
            shipmentRepository.save(s);
        });
        if (order.getUser() != null) {
            referralService.creditOnFirstDelivery(order.getUser().getId());
        }
    }

    // ---------------------------------------------------------------
    // PRIVATE HELPERS
    // ---------------------------------------------------------------

    private boolean isConfigured() {
        return shiprocketEmail != null && !shiprocketEmail.isBlank()
                && shiprocketPassword != null && !shiprocketPassword.isBlank();
    }

    private String getOrRefreshToken() {
        String cached = redisTemplate.opsForValue().get(TOKEN_CACHE_KEY);
        if (cached != null && !cached.isBlank()) return cached;
        return refreshToken();
    }

    private String refreshToken() {
        @SuppressWarnings("unchecked")
        Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                .post().uri("/auth/login")
                .bodyValue(Map.of("email", shiprocketEmail, "password", shiprocketPassword))
                .retrieve().bodyToMono(Map.class)
                .block(Duration.ofSeconds(10));
        String token = resp != null ? String.valueOf(resp.getOrDefault("token", "")) : "";
        if (!token.isBlank()) {
            redisTemplate.opsForValue().set(TOKEN_CACHE_KEY, token, 23, TimeUnit.HOURS);
        }
        return token;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> createShiprocketOrder(String token, Order order, List<OrderItem> items) {
        Map<String, Object> snap = order.getAddressSnapshot();
        List<Map<String, Object>> orderItems = items.stream()
                .map(i -> Map.<String, Object>of(
                        "name", i.getProductName(),
                        "sku", i.getId().toString(),
                        "units", i.getQuantity(),
                        "selling_price", i.getUnitPrice(),
                        "discount", 0,
                        "tax", i.getGstPercent() != null ? i.getGstPercent() : 5,
                        "hsn", i.getHsnCode() != null ? i.getHsnCode() : ""))
                .toList();

        Map<String, Object> payload = Map.of(
                "order_id", order.getOrderNumber(),
                "order_date", order.getPlacedAt().toLocalDate().toString(),
                "pickup_location", pickupLocation,
                "billing_customer_name", snap.getOrDefault("fullName", "Customer"),
                "billing_address", snap.getOrDefault("addressLine", ""),
                "billing_city", snap.getOrDefault("city", ""),
                "billing_state", snap.getOrDefault("state", ""),
                "billing_country", "India",
                "billing_pincode", snap.getOrDefault("pincode", ""),
                "billing_email", order.getUser().getEmail() != null ? order.getUser().getEmail() : "",
                "billing_phone", snap.getOrDefault("mobile", order.getUser().getMobile()),
                "shipping_is_billing", true,
                "order_items", orderItems,
                "payment_method", order.getIsCod() ? "COD" : "Prepaid",
                "sub_total", order.getSubtotal(),
                "length", 30, "breadth", 20, "height", 10, "weight", 0.5);

        Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                .post().uri("/orders/create/adhoc")
                .header("Authorization", "Bearer " + token)
                .bodyValue(payload)
                .retrieve().bodyToMono(Map.class)
                .block(Duration.ofSeconds(15));
        return resp != null ? resp : Map.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> assignCourier(String token, String srOrderId) {
        Map<String, Object> resp = (Map<String, Object>) WebClient.create(baseUrl)
                .post().uri("/courier/assign/awb")
                .header("Authorization", "Bearer " + token)
                .bodyValue(Map.of("shipment_id", srOrderId))
                .retrieve().bodyToMono(Map.class)
                .block(Duration.ofSeconds(15));
        return resp != null ? resp : Map.of();
    }

    private void notifyShipped(Order order, String courier, String awb, String trackingUrl) {
        if (order.getUser() == null) return;
        try {
            if (order.getUser().getMobile() != null) {
                whatsAppService.sendShippingUpdate(order.getUser().getMobile(),
                        order.getOrderNumber(), courier, awb, trackingUrl);
            }
            if (order.getUser().getEmail() != null) {
                emailService.sendShippingUpdateEmail(order.getUser().getEmail(),
                        order.getUser().getName(), order.getOrderNumber(), trackingUrl);
            }
        } catch (Exception e) {
            log.warn("Failed to send shipping notifications for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    private String getSnap(Order order, String key) {
        Map<String, Object> snap = order.getAddressSnapshot();
        return snap != null ? String.valueOf(snap.getOrDefault(key, "")) : "";
    }
}
