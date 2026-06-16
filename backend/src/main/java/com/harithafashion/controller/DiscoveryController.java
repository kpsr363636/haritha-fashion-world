package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.RecentlyViewedService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DiscoveryController {
    private final RecentlyViewedService recentlyViewedService;

    @GetMapping("/recently-viewed")
    public ApiResponse<?> recent(@AuthenticationPrincipal UserPrincipal p) {
        if (p == null) return ApiResponse.ok(List.of());
        return ApiResponse.ok(recentlyViewedService.getRecentlyViewed(p.getId()));
    }
}
