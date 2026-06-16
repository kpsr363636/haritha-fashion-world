package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProductCardResponse {
    private UUID id;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private BigDecimal mrp;
    private BigDecimal discountPercent;
    private BigDecimal finalPrice;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private String primaryImageUrl;
    private String categoryName;
    private Boolean inStock;
}
