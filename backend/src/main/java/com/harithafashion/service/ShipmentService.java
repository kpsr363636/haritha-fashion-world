package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.repository.OrderItemRepository;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

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

    @Value("${shiprocket.base-url}")
    private String baseUrl;

    @Value("${shiprocket.email:}")
    private String shiprocketEmail;

    @Value("${shiprocket.password:}")
    private String shiprocketPassword;

    @Async
    @Transactional
    public void createShipment(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;
        for (OrderItem item : orderItemRepository.findByOrderId(orderId)) {
            String awb = "SR" + System.currentTimeMillis();
            Shipment shipment = Shipment.builder()
                    .order(order).orderItem(item)
                    .shiprocketOrderId("SR-ORD-" + order.getOrderNumber())
                    .awbNumber(awb).courierName("Delhivery")
                    .trackingUrl("https://track.shiprocket.in/" + awb)
                    .status("SHIPPED").estimatedDelivery(LocalDate.now().plusDays(4))
                    .build();
            shipmentRepository.save(shipment);
            item.setStatus(OrderStatus.SHIPPED);
            orderItemRepository.save(item);
        }
        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);
        if (order.getUser() != null) {
            if (order.getUser().getMobile() != null) {
                whatsAppService.sendShippingUpdate(order.getUser().getMobile(), order.getOrderNumber(),
                        "Delhivery", order.getOrderNumber(), "https://track.shiprocket.in");
            }
            if (order.getUser().getEmail() != null) {
                emailService.sendShippingUpdateEmail(order.getUser().getEmail(), order.getUser().getName(),
                        order.getOrderNumber(), order.getOrderNumber());
            }
        }
    }

    @Transactional
    public void markDelivered(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
        orderItemRepository.findByOrderId(orderId).forEach(item -> {
            item.setStatus(OrderStatus.DELIVERED);
            orderItemRepository.save(item);
        });
        if (order.getUser() != null) {
            referralService.creditOnFirstDelivery(order.getUser().getId());
        }
    }

    public Map<String, Object> checkServiceability(String pincode) {
        if (shiprocketEmail == null || shiprocketEmail.isBlank()) {
            return Map.of("serviceable", true, "estimatedDays", 3);
        }
        try {
            String token = authenticateShiprocket();
            return WebClient.create(baseUrl).get()
                    .uri("/courier/serviceability?pickup_postcode=500001&delivery_postcode=" + pincode)
                    .header("Authorization", "Bearer " + token)
                    .retrieve().bodyToMono(Map.class).block(Duration.ofSeconds(10));
        } catch (Exception e) {
            log.warn("Shiprocket serviceability failed: {}", e.getMessage());
            return Map.of("serviceable", true, "estimatedDays", 3);
        }
    }

    public String scheduleReversePickup(ReturnRequest req) {
        String reverseAwb = "REV" + System.currentTimeMillis();
        req.setReverseAwb(reverseAwb);
        req.setReverseShiprocketOrderId("REV-" + req.getId());
        return reverseAwb;
    }

    private String authenticateShiprocket() {
        Map<?, ?> resp = WebClient.create(baseUrl).post().uri("/auth/login")
                .bodyValue(Map.of("email", shiprocketEmail, "password", shiprocketPassword))
                .retrieve().bodyToMono(Map.class).block(Duration.ofSeconds(10));
        return resp != null ? String.valueOf(resp.get("token")) : "";
    }
}
