package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/referral")
@RequiredArgsConstructor
public class ReferralController {
    private final ReferralService referralService;

    @GetMapping("/my-code")
    public ApiResponse<Map<String, Object>> myCode(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(referralService.getMyReferral(p.getId()));
    }

    @GetMapping("/link")
    public ApiResponse<Map<String, Object>> link(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(referralService.getMyReferral(p.getId()));
    }
}
