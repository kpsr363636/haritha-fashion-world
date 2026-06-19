package com.harithafashion.dto.response;

import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrderSummaryResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private LocalDateTime placedAt;
    private Integer itemCount;
}
