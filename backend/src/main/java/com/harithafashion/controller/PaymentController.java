package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @PostMapping("/create-order")
    public ApiResponse<Map<String, Object>> createOrder(
            @RequestBody Map<String, UUID> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID orderId = body.get("orderId");
        // Verify the order belongs to the authenticated user
        orderRepository.findById(orderId).ifPresent(order -> {
            if (!order.getUser().getId().equals(principal.getId())) {
                throw new BadRequestException("Order not found");
            }
        });
        return ApiResponse.ok(paymentService.createRazorpayOrder(orderId));
    }

    @PostMapping("/verify")
    public ApiResponse<Void> verify(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String razorpayOrderId = body.get("razorpayOrderId");
        // Verify payment belongs to the authenticated user via Payment→Order→User
        paymentService.verifyPayment(razorpayOrderId,
                body.get("razorpayPaymentId"), body.get("signature"), principal.getId());
        return ApiResponse.ok(null, "Payment verified");
    }

    @PostMapping("/webhook")
    public ApiResponse<Void> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String sig) {
        paymentService.handleWebhook(payload, sig != null ? sig : "");
        return ApiResponse.ok(null);
    }
}
