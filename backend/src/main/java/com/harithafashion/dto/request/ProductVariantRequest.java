package com.harithafashion.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductVariantRequest {
    @NotBlank
    private String size;
    private String color;
    private String colorHex;
    @Min(0)
    private int stockQuantity;
    private String sku;
}
