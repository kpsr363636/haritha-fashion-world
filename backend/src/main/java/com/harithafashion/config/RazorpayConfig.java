package com.harithafashion.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class RazorpayConfig {

    @Bean
    @ConditionalOnExpression(
            "T(org.springframework.util.StringUtils).hasText('${razorpay.key-id:}')"
                    + " && T(org.springframework.util.StringUtils).hasText('${razorpay.key-secret:}')")
    public RazorpayClient razorpayClient(
            @Value("${razorpay.key-id}") String keyId,
            @Value("${razorpay.key-secret}") String keySecret) throws RazorpayException {
        if (!StringUtils.hasText(keyId) || !StringUtils.hasText(keySecret)) {
            throw new IllegalStateException("Razorpay keys must not be blank");
        }
        return new RazorpayClient(keyId.trim(), keySecret.trim());
    }
}
