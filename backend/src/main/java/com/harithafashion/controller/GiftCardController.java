package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.GiftCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/gift-cards")
@RequiredArgsConstructor
public class GiftCardController {
    private final GiftCardService giftCardService;

    @GetMapping("/mine")
    public ApiResponse<?> mine(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(giftCardService.listMine(p.getId()));
    }

    @GetMapping("/{code}/balance")
    public ApiResponse<Map<String, BigDecimal>> balance(@PathVariable String code) {
        return ApiResponse.ok(Map.of("balance", giftCardService.getBalance(code)));
    }

    @PostMapping
    public ApiResponse<?> purchase(@AuthenticationPrincipal UserPrincipal p, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(giftCardService.purchase(p.getId(), new BigDecimal(body.get("amount").toString())));
    }
}
