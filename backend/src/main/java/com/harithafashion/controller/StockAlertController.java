package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/stock-alerts")
@RequiredArgsConstructor
public class StockAlertController {

    private final StockAlertService stockAlertService;

    @PostMapping
    public ApiResponse<Void> subscribe(@AuthenticationPrincipal UserPrincipal p,
                                       @RequestBody Map<String, String> body) {
        stockAlertService.subscribe(p.getId(), UUID.fromString(body.get("variantId")));
        return ApiResponse.ok(null, "Subscribed to back-in-stock alerts");
    }
}
