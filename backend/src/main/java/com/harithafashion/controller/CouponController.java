package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @PostMapping("/apply")
    public ApiResponse<Map<String, BigDecimal>> apply(@AuthenticationPrincipal UserPrincipal p,
                                                      @RequestBody Map<String, Object> body) {
        BigDecimal d = couponService.applyCoupon((String) body.get("code"), p.getId(),
                new BigDecimal(body.get("orderAmount").toString()), null);
        return ApiResponse.ok(Map.of("discount", d));
    }
}
