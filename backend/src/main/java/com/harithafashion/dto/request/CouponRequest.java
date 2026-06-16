package com.harithafashion.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    private String code;
    private String description;
    private String type;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer perUserLimit;
    private Boolean isFirstOrderOnly;
    private Boolean isActive;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}
