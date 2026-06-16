package com.harithafashion.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PlaceOrderRequest {
    @NotNull
    private UUID addressId;

    private String couponCode;
    private String giftCardCode;
    private String paymentMethod;
    private Integer loyaltyPointsToUse;
}
