package com.harithafashion.config;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import redis.embedded.RedisServer;

import java.io.IOException;
import java.net.Socket;

@Configuration
@Profile("dev")
@Slf4j
public class EmbeddedRedisConfig {

    private RedisServer redisServer;

    public EmbeddedRedisConfig(@Value("${REDIS_PORT:6379}") int port) throws IOException {
        if (isPortOpen(port)) {
            log.info("Redis already running on port {}", port);
            return;
        }
        redisServer = new RedisServer(port);
        redisServer.start();
        log.info("Started embedded Redis on port {}", port);
    }

    @PreDestroy
    public void stop() {
        if (redisServer != null && redisServer.isActive()) {
            try {
                redisServer.stop();
            } catch (IOException e) {
                log.warn("Failed to stop embedded Redis", e);
            }
        }
    }

    private boolean isPortOpen(int port) {
        try (Socket socket = new Socket("127.0.0.1", port)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}
