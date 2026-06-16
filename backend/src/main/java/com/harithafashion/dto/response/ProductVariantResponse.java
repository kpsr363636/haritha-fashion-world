package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProductVariantResponse {
    private UUID id;
    private String size;
    private String color;
    private String colorHex;
    private Integer stockQuantity;
    private BigDecimal additionalPrice;
    private String sku;
    private Boolean isActive;
}
