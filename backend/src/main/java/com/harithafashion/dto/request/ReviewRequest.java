package com.harithafashion.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReviewRequest {
    @NotNull
    private UUID orderItemId;

    @Min(1) @Max(5)
    private int rating;

    private String title;
    private String body;
    private List<String> images;
}
