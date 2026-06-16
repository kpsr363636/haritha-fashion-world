package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProductImageResponse {
    private UUID id;
    private String imageUrl;
    private String thumbnailUrl;
    private String altText;
    private Boolean isPrimary;
}
