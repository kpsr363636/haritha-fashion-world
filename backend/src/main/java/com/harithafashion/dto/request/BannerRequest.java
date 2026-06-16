package com.harithafashion.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BannerRequest {
    private String title;
    private String subtitle;
    private String imageUrl;
    private String mobileImageUrl;
    private String linkUrl;
    private String position;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}
