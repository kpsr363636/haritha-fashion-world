package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SellerOrderItemResponse {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private String productName;
    private String variantInfo;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime placedAt;
}
