package com.harithafashion.service;

import com.harithafashion.dto.response.ProductCardResponse;
import com.harithafashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecentlyViewedService {

    private final StringRedisTemplate redisTemplate;
    private final ProductService productService;

    public List<ProductCardResponse> getRecentlyViewed(UUID userId) {
        String key = "VIEWED:" + userId;
        // ZREVRANGE: highest score (most recent timestamp) first, top 10
        java.util.Set<String> ids = redisTemplate.opsForZSet().reverseRange(key, 0, 9);
        if (ids == null || ids.isEmpty()) return List.of();
        List<ProductCardResponse> result = new ArrayList<>();
        for (String id : ids) {
            try {
                result.add(productService.getProductCard(UUID.fromString(id)));
            } catch (Exception ignored) {}
        }
        return result;
    }

    public void trackView(UUID userId, UUID productId) {
        String key = "VIEWED:" + userId;
        double score = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(key, productId.toString(), score);
        // Keep only top 10 most recent (remove oldest beyond rank 9)
        redisTemplate.opsForZSet().removeRange(key, 0, -11);
        redisTemplate.expire(key, 30, java.util.concurrent.TimeUnit.DAYS);
    }
}
