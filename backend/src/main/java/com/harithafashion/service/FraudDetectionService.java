package com.harithafashion.service;

import com.harithafashion.dto.request.PlaceOrderRequest;
import com.harithafashion.entity.Address;
import com.harithafashion.entity.User;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.AddressRepository;
import com.harithafashion.repository.OrderRepository;
import com.harithafashion.repository.ReturnRequestRepository;
import com.harithafashion.util.FraudScorer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final FraudScorer fraudScorer;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final StringRedisTemplate redisTemplate;

    public void checkOrder(User user, PlaceOrderRequest req, BigDecimal total, String ipAddress) {
        Address address = addressRepository.findByIdAndUserId(req.getAddressId(), user.getId()).orElse(null);
        String pincode = address != null ? address.getPincode() : null;
        boolean isCod = "COD".equalsIgnoreCase(req.getPaymentMethod());
        boolean newAccount = fraudScorer.isNewAccount(user.getCreatedAt());
        int ipOrders = getIpOrderCount(ipAddress);
        long disputes = returnRequestRepository.countByUserId(user.getId());
        int score = fraudScorer.score(newAccount, total, isCod, ipOrders, pincode, (int) disputes);
        if (score > 70) {
            throw new BadRequestException("Order cannot be processed. Please contact support.");
        }
        if (score >= 40) {
            redisTemplate.opsForValue().set("fraud:flag:" + user.getId(), "REVIEW", 24, TimeUnit.HOURS);
        }
        incrementIpOrderCount(ipAddress);
    }

    private int getIpOrderCount(String ip) {
        if (ip == null) return 0;
        String v = redisTemplate.opsForValue().get("fraud:ip:" + ip);
        return v == null ? 0 : Integer.parseInt(v);
    }

    private void incrementIpOrderCount(String ip) {
        if (ip == null) return;
        String key = "fraud:ip:" + ip;
        Long c = redisTemplate.opsForValue().increment(key);
        if (c != null && c == 1) redisTemplate.expire(key, 1, TimeUnit.HOURS);
    }
}
