package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/transactions")
    public ApiResponse<?> transactions(@AuthenticationPrincipal UserPrincipal p,
                                       @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(loyaltyService.getTransactions(p.getId(), page, 20));
    }

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> summary(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(loyaltyService.getSummary(p.getId()));
    }
}
