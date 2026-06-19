package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CategoryVariantSizesResponse {
    private String label;
    private String guideType;
    private List<String> sizes;
}
