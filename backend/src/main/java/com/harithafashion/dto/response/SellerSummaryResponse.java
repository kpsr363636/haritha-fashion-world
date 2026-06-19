package com.harithafashion.dto.response;

import com.harithafashion.entity.enums.SellerStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class SellerSummaryResponse {
    private UUID id;
    private String businessName;
    private String businessType;
    private SellerStatus status;
    private UUID userId;
    private String userName;
    private String userEmail;
    private BigDecimal avgRating;
    private BigDecimal fulfillmentRate;
}
