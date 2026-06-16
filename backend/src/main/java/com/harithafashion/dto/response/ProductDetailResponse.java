package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductDetailResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String fabric;
    private String occasion;
    private String careInstructions;
    private BigDecimal basePrice;
    private BigDecimal mrp;
    private BigDecimal discountPercent;
    private BigDecimal finalPrice;
    private BigDecimal gstPercent;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Boolean isCodAvailable;
    private Boolean isReturnable;
    private Integer returnWindowDays;
    private String sellerName;
    private BigDecimal sellerRating;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
    private String videoUrl;
}
