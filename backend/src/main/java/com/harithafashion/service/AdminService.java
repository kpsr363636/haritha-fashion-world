package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.SellerStatus;
import com.harithafashion.entity.enums.UserRole;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.harithafashion.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final EmailService emailService;
    private final ShipmentService shipmentService;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final SellerPayoutRepository sellerPayoutRepository;

    public Map<String, Object> dashboard() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalOrders", orderRepository.count());
        m.put("totalRevenue", orderRepository.sumTotalRevenue());
        m.put("totalUsers", userRepository.count());
        m.put("totalSellers", sellerRepository.count());
        m.put("totalProducts", productRepository.count());
        m.put("pendingReturns", returnRequestRepository.findByStatusOrderByCreatedAtDesc(
                "REQUESTED", PageRequest.of(0, 1)).getTotalElements());
        return m;
    }

    public Page<Order> listOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size));
    }

    public Page<User> listUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size));
    }

    public User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User blockUser(UUID id) {
        User u = userRepository.findById(id).orElseThrow();
        u.setIsBlocked(true);
        return userRepository.save(u);
    }

    @Transactional
    public User unblockUser(UUID id) {
        User u = userRepository.findById(id).orElseThrow();
        u.setIsBlocked(false);
        return userRepository.save(u);
    }

    @Transactional
    public User updateRole(UUID id, String role) {
        User u = userRepository.findById(id).orElseThrow();
        u.setRole(UserRole.valueOf(role));
        return userRepository.save(u);
    }

    public Page<Seller> listSellers(int page, int size, SellerStatus status) {
        if (status != null) {
            return sellerRepository.findByStatus(status, PageRequest.of(page, size));
        }
        return sellerRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public Seller approveSeller(UUID id) {
        Seller s = sellerRepository.findById(id).orElseThrow();
        s.setStatus(SellerStatus.APPROVED);
        s = sellerRepository.save(s);
        if (s.getUser().getEmail() != null) {
            emailService.sendSellerStatusEmail(s.getUser().getEmail(), s.getUser().getName(), "APPROVED");
        }
        return s;
    }

    @Transactional
    public Seller rejectSeller(UUID id) {
        Seller s = sellerRepository.findById(id).orElseThrow();
        s.setStatus(SellerStatus.REJECTED);
        s = sellerRepository.save(s);
        if (s.getUser().getEmail() != null) {
            emailService.sendSellerStatusEmail(s.getUser().getEmail(), s.getUser().getName(), "REJECTED");
        }
        return s;
    }

    @Transactional
    public Seller suspendSeller(UUID id) {
        Seller s = sellerRepository.findById(id).orElseThrow();
        s.setStatus(SellerStatus.SUSPENDED);
        return sellerRepository.save(s);
    }

    @Transactional
    public void markOrderDelivered(UUID orderId) {
        shipmentService.markDelivered(orderId);
    }

    @Transactional
    public void shipOrder(UUID orderId) {
        shipmentService.createShipment(orderId);
    }

    public Page<ReturnRequest> listReturns(int page, int size, String status) {
        if (status != null && !status.isBlank()) {
            return returnRequestRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
        }
        return returnRequestRepository.findAll(PageRequest.of(page, size));
    }

    /**
     * Admin impersonation — generates a short-lived read-only token for the target user.
     * The token carries an extra claim that marks it as an impersonation token so that
     * write endpoints can optionally reject it.
     */
    public Map<String, String> impersonateUser(UUID targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtUtil.generateImpersonationToken(target);
        return Map.of(
                "token", token,
                "userId", target.getId().toString(),
                "email", target.getEmail() != null ? target.getEmail() : "",
                "name", target.getName(),
                "note", "Impersonation token — read-only, expires in 30 minutes");
    }

    public Page<Map<String, Object>> fraudFlaggedUsers(int page, int size) {
        Set<String> keys = redisTemplate.keys("fraud:flag:*");
        if (keys == null || keys.isEmpty()) {
            return new PageImpl<>(List.of(), PageRequest.of(page, size), 0);
        }
        List<UUID> ids = keys.stream()
                .map(k -> k.replace("fraud:flag:", ""))
                .map(s -> { try { return UUID.fromString(s); } catch (Exception e) { return null; } })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        int start = page * size;
        int end = Math.min(start + size, ids.size());
        List<UUID> pageIds = (start >= ids.size()) ? List.of() : ids.subList(start, end);

        List<Map<String, Object>> result = userRepository.findAllById(pageIds).stream().map(u -> {
            String flag = redisTemplate.opsForValue().get("fraud:flag:" + u.getId());
            return Map.<String, Object>of(
                    "id", u.getId(),
                    "name", u.getName(),
                    "email", u.getEmail() != null ? u.getEmail() : "",
                    "mobile", u.getMobile() != null ? u.getMobile() : "",
                    "fraudFlag", flag != null ? flag : "REVIEW",
                    "blocked", Boolean.TRUE.equals(u.getIsBlocked()));
        }).collect(Collectors.toList());

        return new PageImpl<>(result, PageRequest.of(page, size), ids.size());
    }

    public void clearFraudFlag(UUID userId) {
        redisTemplate.delete("fraud:flag:" + userId);
    }

    public Page<?> listPayouts(int page, int size) {
        return sellerPayoutRepository.findAllByOrderByProcessedAtDesc(PageRequest.of(page, size));
    }
}
