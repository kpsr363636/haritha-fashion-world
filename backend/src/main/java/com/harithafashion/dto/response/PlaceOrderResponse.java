package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PlaceOrderResponse {
    private UUID orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private boolean requiresPayment;
    private boolean requiresCodVerification;
    private String razorpayOrderId;
    private String razorpayKeyId;
}
