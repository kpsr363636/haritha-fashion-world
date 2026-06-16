package com.harithafashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateProductRequest {
    @NotNull
    private UUID categoryId;
    @NotBlank
    private String name;
    private String description;
    private String fabric;
    private String occasion;
    @NotNull
    private BigDecimal basePrice;
    @NotNull
    private BigDecimal mrp;
    private BigDecimal discountPercent;
    private BigDecimal gstPercent;
    private Boolean isCodAvailable;
    private Boolean isReturnable;
    private Integer returnWindowDays;
    private List<ProductVariantRequest> variants;
    private List<ProductImageRequest> images;
}
