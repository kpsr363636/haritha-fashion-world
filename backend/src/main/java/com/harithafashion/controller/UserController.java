package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.entity.NotificationPreference;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;

    @GetMapping("/notification-preferences")
    public ApiResponse<NotificationPreference> getPrefs(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(userProfileService.getNotificationPreferences(p.getId()));
    }

    @PutMapping("/notification-preferences")
    public ApiResponse<NotificationPreference> updatePrefs(@AuthenticationPrincipal UserPrincipal p,
                                                           @RequestBody NotificationPreference prefs) {
        return ApiResponse.ok(userProfileService.updateNotificationPreferences(p.getId(), prefs));
    }
}
