package com.harithafashion.service;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.AuthResponse;
import com.harithafashion.dto.response.UserResponse;
import com.harithafashion.entity.*;
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
        Map<String, Object> tokenInfo = WebClient.create()
                .get()
                .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + req.getGoogleToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        if (tokenInfo == null || tokenInfo.get("email") == null) {
            throw new UnauthorizedException("Invalid Google token");
        }
        if (googleClientId != null && !googleClientId.isBlank()) {
            Object aud = tokenInfo.get("aud");
            if (aud == null || !googleClientId.equals(aud.toString())) {
                throw new UnauthorizedException("Invalid Google token audience");
            }
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
