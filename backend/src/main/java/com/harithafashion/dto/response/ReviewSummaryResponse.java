package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewSummaryResponse {
    private UUID id;
    private String productName;
    private Integer rating;
    private String title;
    private String body;
    private String sellerReply;
    private LocalDateTime createdAt;
}
