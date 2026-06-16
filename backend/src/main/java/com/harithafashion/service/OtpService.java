package com.harithafashion.service;

import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom random = new SecureRandom();

    @Value("${msg91.api-key:}")
    private String apiKey;

    @Value("${msg91.otp-template-id:}")
    private String otpTemplateId;

    private static final String OTP_PREFIX = "OTP:";
    private static final String OTP_RATE_PREFIX = "OTP_RATE:";
    private static final String OTP_ATTEMPT_PREFIX = "OTP_ATTEMPT:";
    private static final int MAX_OTP_PER_HOUR = 5;
    private static final int MAX_VERIFY_ATTEMPTS = 3;

    public void sendOtp(String mobile) {
        String rateKey = OTP_RATE_PREFIX + mobile;
        Long count = redisTemplate.opsForValue().increment(rateKey);
        if (count != null && count == 1) {
            redisTemplate.expire(rateKey, 1, TimeUnit.HOURS);
        }
        if (count != null && count > MAX_OTP_PER_HOUR) {
            throw new TooManyRequestsException("Too many OTP requests. Try again after 1 hour.");
        }

        String otp = String.format("%06d", random.nextInt(1_000_000));
        redisTemplate.opsForValue().set(OTP_PREFIX + mobile, otp, Duration.ofMinutes(10));
        redisTemplate.delete(OTP_ATTEMPT_PREFIX + mobile);

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                WebClient.create("https://api.msg91.com")
                        .post()
                        .uri("/api/v5/otp")
                        .header("authkey", apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of(
                                "mobile", "91" + mobile,
                                "template_id", otpTemplateId,
                                "otp", otp))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block(Duration.ofSeconds(10));
            } catch (Exception e) {
                log.warn("MSG91 OTP send failed for {}: {}", mobile, e.getMessage());
            }
        } else {
            log.info("DEV OTP for {}: {}", mobile, otp);
        }
    }

    public boolean verifyOtp(String mobile, String otp) {
        String attemptKey = OTP_ATTEMPT_PREFIX + mobile;
        String stored = redisTemplate.opsForValue().get(OTP_PREFIX + mobile);
        if (stored == null) {
            throw new BadRequestException("OTP expired or not sent");
        }
        if (!stored.equals(otp)) {
            Long attempts = redisTemplate.opsForValue().increment(attemptKey);
            if (attempts != null && attempts == 1) {
                redisTemplate.expire(attemptKey, 10, TimeUnit.MINUTES);
            }
            if (attempts != null && attempts >= MAX_VERIFY_ATTEMPTS) {
                redisTemplate.delete(OTP_PREFIX + mobile);
                throw new BadRequestException("Too many invalid attempts. Request a new OTP.");
            }
            throw new BadRequestException("Invalid OTP");
        }
        redisTemplate.delete(OTP_PREFIX + mobile);
        redisTemplate.delete(attemptKey);
        return true;
    }
}
