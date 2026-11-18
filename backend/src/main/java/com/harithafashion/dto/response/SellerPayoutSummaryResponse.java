package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SellerPayoutSummaryResponse {
    private UUID id;
    private UUID sellerId;
    private String sellerName;
    private BigDecimal amount;
    private String status;
    private String notes;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
