package com.harithafashion.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${msg91.api-key:}")
    private String apiKey;

    @Value("${msg91.whatsapp-template-order-confirm:}")
    private String orderTemplate;

    @Value("${msg91.whatsapp-template-shipped:}")
    private String shippedTemplate;

    @Value("${msg91.sender-id:HRTHFW}")
    private String senderId;

    public void sendOrderConfirmation(String mobile, String orderNumber, String total, String eta) {
        sendFlow(orderTemplate, mobile, Map.of("VAR1", orderNumber, "VAR2", total, "VAR3", eta));
    }

    public void sendShippingUpdate(String mobile, String orderNumber, String courier, String awb, String trackingUrl) {
        sendFlow(shippedTemplate, mobile, Map.of("VAR1", orderNumber, "VAR2", courier, "VAR3", awb, "VAR4", trackingUrl));
    }

    private void sendFlow(String flowId, String mobile, Map<String, String> vars) {
        if (apiKey == null || apiKey.isBlank() || flowId == null || flowId.isBlank()) {
            log.info("DEV WhatsApp to {} flow={} vars={}", mobile, flowId, vars);
            return;
        }
        Map<String, Object> body = new HashMap<>();
        body.put("flow_id", flowId);
        body.put("sender", senderId);
        body.put("mobiles", "91" + mobile);
        body.putAll(vars);
        try {
            WebClient.create("https://api.msg91.com").post().uri("/api/v5/flow/")
                    .header("authkey", apiKey).contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body).retrieve().bodyToMono(String.class).block(Duration.ofSeconds(10));
        } catch (Exception e) {
            log.warn("WhatsApp failed: {}", e.getMessage());
        }
    }
}
