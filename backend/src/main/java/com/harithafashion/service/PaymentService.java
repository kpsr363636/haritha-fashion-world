package com.harithafashion.service;

import com.harithafashion.entity.Order;
import com.harithafashion.entity.Payment;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.PaymentException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentService shipmentService;

    @Autowired(required = false)
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @Transactional
    public Map<String, Object> createRazorpayOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Order already paid");
        }
        int amountPaise = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();
        String razorpayOrderId;
        if (razorpayClient != null) {
            try {
                JSONObject options = new JSONObject();
                options.put("amount", amountPaise);
                options.put("currency", "INR");
                options.put("receipt", order.getOrderNumber());
                razorpayOrderId = razorpayClient.orders.create(options).get("id");
            } catch (RazorpayException e) {
                throw new PaymentException("Failed to create Razorpay order: " + e.getMessage());
            }
        } else {
            razorpayOrderId = "order_dev_" + order.getOrderNumber();
        }
        paymentRepository.save(Payment.builder()
                .order(order).razorpayOrderId(razorpayOrderId)
                .amount(order.getTotalAmount()).status("PENDING").build());
        return Map.of("razorpayOrderId", razorpayOrderId, "amount", amountPaise,
                "currency", "INR", "keyId", keyId != null ? keyId : "");
    }

    @Transactional
    public void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature) {
        if (razorpayOrderId != null && razorpayOrderId.startsWith("order_dev_")) {
            markPaymentPaid(razorpayOrderId, razorpayPaymentId != null ? razorpayPaymentId : "pay_dev", signature);
            return;
        }
        if (!verifySignature(razorpayOrderId, razorpayPaymentId, signature)) {
            throw new PaymentException("Invalid payment signature");
        }
        markPaymentPaid(razorpayOrderId, razorpayPaymentId, signature);
    }

    private void markPaymentPaid(String razorpayOrderId, String razorpayPaymentId, String signature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        shipmentService.createShipment(order.getId());
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            String expected = hmacSha256(payload, webhookSecret);
            if (!expected.equals(signature)) throw new PaymentException("Invalid webhook signature");
        }
        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event");
        if ("payment.captured".equals(eventType)) {
            JSONObject entity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            verifyPayment(entity.getString("order_id"), entity.getString("id"), signature);
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        if (keySecret == null || keySecret.isBlank()) return true;
        String generated = hmacSha256(orderId + "|" + paymentId, keySecret);
        return generated.equals(signature);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new PaymentException("Signature verification failed");
        }
    }
}
