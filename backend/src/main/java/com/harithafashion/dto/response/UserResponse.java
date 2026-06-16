package com.harithafashion.dto.response;

import com.harithafashion.entity.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String mobile;
    private UserRole role;
    private Boolean isVerified;
    private String profileImageUrl;
    private String referralCode;
    private Integer loyaltyPoints;
    private String loyaltyTier;
}
