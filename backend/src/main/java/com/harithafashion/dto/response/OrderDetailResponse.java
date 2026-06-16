package com.harithafashion.dto.response;

import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class OrderDetailResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private Boolean isCod;
    private Boolean codOtpVerified;
    private Boolean requiresCodVerification;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal gstAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal totalAmount;
    private Map<String, Object> addressSnapshot;
    private String addressDisplay;
    private LocalDateTime placedAt;
    private List<OrderItemDetailResponse> items;
    private ShipmentSummaryResponse shipment;
}
