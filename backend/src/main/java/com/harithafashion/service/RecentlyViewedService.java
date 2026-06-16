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
        String key = "recently_viewed:user:" + userId;
        List<String> ids = redisTemplate.opsForList().range(key, 0, 9);
        if (ids == null) return List.of();
        List<ProductCardResponse> result = new ArrayList<>();
        for (String id : ids) {
            try {
                result.add(productService.getProductCard(UUID.fromString(id)));
            } catch (Exception ignored) {}
        }
        return result;
    }

    public void trackView(UUID userId, UUID productId) {
        String key = "recently_viewed:user:" + userId;
        redisTemplate.opsForList().remove(key, 0, productId.toString());
        redisTemplate.opsForList().leftPush(key, productId.toString());
        redisTemplate.opsForList().trim(key, 0, 9);
    }
}
