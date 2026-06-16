package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
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

    @PostMapping("/create-order")
    public ApiResponse<Map<String, Object>> createOrder(@RequestBody Map<String, UUID> body) {
        return ApiResponse.ok(paymentService.createRazorpayOrder(body.get("orderId")));
    }

    @PostMapping("/verify")
    public ApiResponse<Void> verify(@RequestBody Map<String, String> body) {
        paymentService.verifyPayment(body.get("razorpayOrderId"), body.get("razorpayPaymentId"), body.get("signature"));
        return ApiResponse.ok(null, "Payment verified");
    }

    @PostMapping("/webhook")
    public ApiResponse<Void> webhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String sig) {
        paymentService.handleWebhook(payload, sig);
        return ApiResponse.ok(null);
    }
}
