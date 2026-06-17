package com.harithafashion.controller;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.AuthResponse;
import com.harithafashion.security.JwtUtil;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    @PostMapping("/send-otp")
    public ApiResponse<Void> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request.getMobile());
        return ApiResponse.ok(null, "OTP sent successfully");
    }

    @PostMapping("/verify-otp")
    public ApiResponse<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ApiResponse.ok(authService.verifyOtpAndLogin(request.getMobile(), request.getOtp()));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.registerWithEmail(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.loginWithEmail(request));
    }

    @PostMapping("/google-login")
    public ApiResponse<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ApiResponse.ok(authService.googleLogin(request));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ApiResponse.ok(authService.refreshToken(token));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String jti = jwtUtil.getJti(token);
            if (jti != null) {
                long ttl = jwtUtil.getRemainingTtlMs(token);
                if (ttl > 0) {
                    redisTemplate.opsForValue().set("jwt:blacklist:" + jti, "1", ttl, TimeUnit.MILLISECONDS);
                }
            }
        }
        return ApiResponse.ok(null, "Logged out successfully");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok(null, "If the email exists, a reset link was sent");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(null, "Password reset successful");
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getId(), request);
        return ApiResponse.ok(null, "Password changed");
    }

    @PostMapping("/newsletter-subscribe")
    public ApiResponse<Void> newsletterSubscribe(@RequestBody java.util.Map<String, String> body) {
        // Record the email in the user's notification prefs or log it
        // In a full implementation this would store in a newsletter list
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ApiResponse.ok(null, "Email required");
        }
        return ApiResponse.ok(null, "Subscribed successfully");
    }
}
