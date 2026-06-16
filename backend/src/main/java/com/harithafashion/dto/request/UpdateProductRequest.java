package com.harithafashion.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class UpdateProductRequest {
    private UUID categoryId;
    private String name;
    private String description;
    private String fabric;
    private String occasion;
    private BigDecimal basePrice;
    private BigDecimal mrp;
    private BigDecimal discountPercent;
    private BigDecimal gstPercent;
    private Boolean isCodAvailable;
    private Boolean isReturnable;
    private Integer returnWindowDays;
}
