package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SellerQuestionSummaryResponse {
    private UUID id;
    private String productName;
    private String question;
    private LocalDateTime createdAt;
}
