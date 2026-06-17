package com.harithafashion.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Warns on start-up if security-sensitive config values are still at defaults.
 * In prod profile, these are treated as hard errors.
 */
@Component
@Slf4j
public class StartupGuard {

    @Value("${jwt.secret:changeme_replace_this_secret_in_prod}")
    private String jwtSecret;

    private final Environment env;

    public StartupGuard(Environment env) {
        this.env = env;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void check() {
        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod");

        if ("changeme_replace_this_secret_in_prod".equals(jwtSecret) ||
                "your-very-long-random-secret".equals(jwtSecret) ||
                jwtSecret.length() < 32) {
            String msg = "SECURITY: JWT_SECRET is set to an insecure default value! " +
                    "Set JWT_SECRET env var to a cryptographically random 64+ char string.";
            if (isProd) {
                throw new IllegalStateException(msg);
            } else {
                log.warn(msg);
            }
        }
    }
}
