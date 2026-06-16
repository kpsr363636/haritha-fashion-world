package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.PaymentStatus;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SellerRepository sellerRepository;
    private final LoyaltyService loyaltyService;

    @Autowired(required = false)
    private RazorpayClient razorpayClient;

    @Transactional
    public Refund processRefund(UUID orderId, UUID orderItemId, BigDecimal amount, String reason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(orderId).orElse(null);
        Refund refund = Refund.builder().order(order).amount(amount).reason(reason).status("PENDING").build();
        if (orderItemId != null) {
            OrderItem item = orderItemRepository.findById(orderItemId).orElseThrow();
            refund.setOrderItem(item);
            if (item.getSeller() != null && item.getSellerAmount() != null) {
                Seller seller = item.getSeller();
                seller.setPendingPayout(seller.getPendingPayout().subtract(item.getSellerAmount()).max(BigDecimal.ZERO));
                sellerRepository.save(seller);
            }
        }
        if (payment != null && payment.getRazorpayPaymentId() != null && razorpayClient != null) {
            try {
                JSONObject req = new JSONObject();
                req.put("amount", amount.multiply(new BigDecimal("100")).intValue());
                var rpRefund = razorpayClient.payments.refund(payment.getRazorpayPaymentId(), req);
                refund.setRazorpayRefundId(rpRefund.get("id"));
                refund.setStatus("PROCESSED");
                refund.setProcessedAt(LocalDateTime.now());
            } catch (RazorpayException e) {
                log.warn("Razorpay refund failed: {}", e.getMessage());
                refund.setStatus("FAILED");
            }
        } else {
            refund.setStatus("PROCESSED");
            refund.setProcessedAt(LocalDateTime.now());
        }
        refund.setPayment(payment);
        refundRepository.save(refund);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        orderRepository.save(order);
        loyaltyService.deductForOrderCancel(order);
        return refund;
    }
}
