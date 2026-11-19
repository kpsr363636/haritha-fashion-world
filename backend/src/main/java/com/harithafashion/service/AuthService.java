package com.harithafashion.service;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.AuthResponse;
import com.harithafashion.dto.response.UserResponse;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.CouponType;
import com.harithafashion.entity.enums.UserRole;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.UnauthorizedException;
import com.harithafashion.repository.*;
import com.harithafashion.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final ReferralRepository referralRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendOtp(String mobile) {
        otpService.sendOtp(mobile);
    }

    @Transactional
    public AuthResponse verifyOtpAndLogin(String mobile, String otp) {
        otpService.verifyOtp(mobile, otp);
        boolean isNewUser = false;
        User user = userRepository.findByMobile(mobile).orElse(null);
        if (user == null) {
            isNewUser = true;
            user = User.builder()
                    .mobile(mobile)
                    .role(UserRole.CUSTOMER)
                    .isVerified(true)
                    .referralCode(generateReferralCode())
                    .build();
            user = userRepository.save(user);
            createUserDefaults(user);
        }
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        return buildAuthResponse(user, isNewUser);
    }

    @Transactional
    public AuthResponse registerWithEmail(RegisterRequest req) {
        if (userRepository.existsByMobile(req.getMobile())) {
            throw new BadRequestException("Mobile already registered");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .mobile(req.getMobile())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(UserRole.CUSTOMER)
                .isVerified(true)
                .referralCode(generateReferralCode())
                .build();
        user = userRepository.save(user);
        createUserDefaults(user);
        if (req.getReferralCode() != null) {
            applyReferral(user, req.getReferralCode());
        }
        emailService.sendWelcomeEmail(user);
        return buildAuthResponse(user, true);
    }

    @Transactional
    public AuthResponse loginWithEmail(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new UnauthorizedException("Account is blocked");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setIsBlocked(true);
            }
            userRepository.save(user);
            throw new UnauthorizedException("Invalid credentials");
        }
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return buildAuthResponse(user, false);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest req) {
        // Without a configured client ID we cannot check the token's audience, and a token
        // issued to any other Google app would be accepted — so refuse instead.
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new UnauthorizedException("Google login is not configured");
        }
        if (req.getGoogleToken() == null || req.getGoogleToken().isBlank()) {
            throw new UnauthorizedException("Invalid Google token");
        }
        Map<String, Object> tokenInfo;
        try {
            tokenInfo = WebClient.create()
                    .get()
                    .uri(uri -> uri.scheme("https").host("oauth2.googleapis.com").path("/tokeninfo")
                            .queryParam("id_token", req.getGoogleToken()).build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid Google token");
        }
        if (tokenInfo == null || tokenInfo.get("email") == null || tokenInfo.get("sub") == null) {
            throw new UnauthorizedException("Invalid Google token");
        }
        Object aud = tokenInfo.get("aud");
        if (aud == null || !googleClientId.equals(aud.toString())) {
            throw new UnauthorizedException("Invalid Google token audience");
        }
        // Accounts are linked by email below, so only trust emails Google has verified
        if (!"true".equalsIgnoreCase(String.valueOf(tokenInfo.get("email_verified")))) {
            throw new UnauthorizedException("Google email is not verified");
        }
        String email = (String) tokenInfo.get("email");
        String name = (String) tokenInfo.getOrDefault("name", "");
        String googleId = (String) tokenInfo.get("sub");
        boolean isNewUser = false;
        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);
        if (user == null) {
            isNewUser = true;
            user = User.builder()
                    .name(name)
                    .email(email)
                    .googleId(googleId)
                    .mobile("9" + UUID.randomUUID().toString().replace("-", "").substring(0, 9))
                    .role(UserRole.CUSTOMER)
                    .isVerified(true)
                    .referralCode(generateReferralCode())
                    .build();
            user = userRepository.save(user);
            createUserDefaults(user);
            emailService.sendWelcomeEmail(user);
        } else if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
        }
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return buildAuthResponse(user, isNewUser);
    }

    public AuthResponse refreshToken(String token) {
        if (!jwtUtil.isValid(token)) {
            throw new UnauthorizedException("Invalid token");
        }
        UUID userId = jwtUtil.getUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return buildAuthResponse(user, false);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByPasswordResetToken(req.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token expired");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getPasswordHash() == null || !passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    private void createUserDefaults(User user) {
        cartRepository.save(Cart.builder().user(user).build());
        wishlistRepository.save(Wishlist.builder().user(user).build());
        notificationPreferenceRepository.save(NotificationPreference.builder().user(user).build());
        createWelcomeCoupon(user);
    }

    private void createWelcomeCoupon(User user) {
        // Per-user WELCOME10 code: WELCOME10-{6-char suffix} so each user gets their own
        String code = "WELCOME10-" + user.getId().toString().replace("-", "").substring(0, 6).toUpperCase();
        if (!couponRepository.existsByCode(code)) {
            couponRepository.save(Coupon.builder()
                    .code(code)
                    .description("Welcome offer — 10% off your first order")
                    .type(CouponType.PERCENTAGE)
                    .discountValue(new BigDecimal("10"))
                    .maxDiscountAmount(new BigDecimal("200"))
                    .minOrderAmount(new BigDecimal("499"))
                    .isFirstOrderOnly(true)
                    .perUserLimit(1)
                    .usageLimit(1)
                    .validFrom(LocalDateTime.now())
                    .validUntil(LocalDateTime.now().plusDays(30))
                    .isActive(true)
                    .build());
        }
    }

    private void applyReferral(User referee, String referralCode) {
        userRepository.findByReferralCode(referralCode).ifPresent(referrer -> {
            referralRepository.save(Referral.builder()
                    .referrer(referrer)
                    .referee(referee)
                    .status("PENDING")
                    .build());
            referee.setReferredBy(referrer);
            userRepository.save(referee);
        });
    }

    private String generateReferralCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        } while (userRepository.findByReferralCode(code).isPresent());
        return code;
    }

    private AuthResponse buildAuthResponse(User user, boolean isNewUser) {
        String token = jwtUtil.generateToken(user.getId(), user.getMobile(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .isNewUser(isNewUser)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .role(user.getRole())
                        .isVerified(user.getIsVerified())
                        .profileImageUrl(user.getProfileImageUrl())
                        .referralCode(user.getReferralCode())
                        .loyaltyPoints(user.getLoyaltyPoints())
                        .loyaltyTier(user.getLoyaltyTier())
                        .build())
                .build();
    }
}
