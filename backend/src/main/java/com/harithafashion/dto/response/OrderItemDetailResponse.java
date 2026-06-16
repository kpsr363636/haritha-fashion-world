package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemDetailResponse {
    private UUID id;
    private String productName;
    private String productImage;
    private String variantInfo;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String status;
}
