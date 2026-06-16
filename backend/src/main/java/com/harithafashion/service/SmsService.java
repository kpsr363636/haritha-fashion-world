package com.harithafashion.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class SmsService {

    @Value("${msg91.api-key:}")
    private String apiKey;

    @Value("${msg91.sender-id:HRTHFW}")
    private String senderId;

    public void sendSms(String mobile, String message) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("DEV SMS to {}: {}", mobile, message);
            return;
        }
        try {
            WebClient.create("https://api.msg91.com")
                    .post().uri("/api/v5/flow/")
                    .header("authkey", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("sender", senderId, "mobiles", "91" + mobile, "message", message))
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(10));
        } catch (Exception e) {
            log.warn("SMS failed for {}: {}", mobile, e.getMessage());
        }
    }

    public void sendCodOtp(String mobile, String otp) {
        sendSms(mobile, "Your Haritha Fashion COD delivery OTP is " + otp);
    }
}
