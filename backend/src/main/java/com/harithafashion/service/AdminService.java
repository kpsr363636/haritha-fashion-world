package com.harithafashion.service;

import com.harithafashion.dto.response.OrderSummaryResponse;
import com.harithafashion.dto.response.SellerPayoutSummaryResponse;
import com.harithafashion.dto.response.SellerSummaryResponse;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.SellerStatus;
import com.harithafashion.entity.enums.UserRole;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.harithafashion.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
    private final OrderItemRepository orderItemRepository;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

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

    public Page<OrderSummaryResponse> listOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size))
                .map(this::toOrderSummary);
    }

    private OrderSummaryResponse toOrderSummary(Order order) {
        int itemCount = orderItemRepository.findByOrderId(order.getId()).size();
        return OrderSummaryResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .placedAt(order.getPlacedAt())
                .itemCount(itemCount)
                .build();
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
        UserRole newRole = UserRole.valueOf(role);
        u.setRole(newRole);
        userRepository.save(u);
        if (newRole == UserRole.SELLER && sellerRepository.findByUserId(id).isEmpty()) {
            sellerRepository.save(Seller.builder()
                    .user(u)
                    .businessName(u.getName() + "'s Store")
                    .businessType("Individual")
                    .status(SellerStatus.PENDING)
                    .build());
        }
        return u;
    }

    @Transactional(readOnly = true)
    public Page<SellerSummaryResponse> listSellers(int page, int size, SellerStatus status) {
        Page<Seller> sellers = status != null
                ? sellerRepository.findByStatus(status, PageRequest.of(page, size))
                : sellerRepository.findAll(PageRequest.of(page, size));
        return sellers.map(this::toSellerSummary);
    }

    private SellerSummaryResponse toSellerSummary(Seller s) {
        User u = s.getUser();
        return SellerSummaryResponse.builder()
                .id(s.getId())
                .businessName(s.getBusinessName())
                .businessType(s.getBusinessType())
                .status(s.getStatus())
                .userId(u != null ? u.getId() : null)
                .userName(u != null ? u.getName() : null)
                .userEmail(u != null ? u.getEmail() : null)
                .avgRating(s.getAvgRating())
                .fulfillmentRate(s.getFulfillmentRate())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<SellerPayoutSummaryResponse> listPayouts(int page, int size) {
        return sellerPayoutRepository.findAllByOrderByProcessedAtDesc(PageRequest.of(page, size))
                .map(p -> SellerPayoutSummaryResponse.builder()
                        .id(p.getId())
                        .sellerId(p.getSeller() != null ? p.getSeller().getId() : null)
                        .sellerName(p.getSeller() != null ? p.getSeller().getBusinessName() : null)
                        .amount(p.getAmount())
                        .status(p.getStatus())
                        .notes(p.getNotes())
                        .processedAt(p.getProcessedAt())
                        .createdAt(p.getCreatedAt())
                        .build());
    }

    @Transactional
    public Seller approveSeller(UUID id) {
        Seller s = sellerRepository.findById(id).orElseThrow();
        s.setStatus(SellerStatus.APPROVED);
        s.setKycVerified(true);
        s = sellerRepository.save(s);
        // Update user role to SELLER
        User u = s.getUser();
        u.setRole(UserRole.SELLER);
        userRepository.save(u);
        // Create Razorpay X contact + fund account if keys available
        if (!razorpayKeyId.isBlank() && !razorpayKeySecret.isBlank()
                && s.getRazorpayContactId() == null
                && s.getBankAccountNumber() != null) {
            createRazorpayXContact(s);
        }
        if (u.getEmail() != null) {
            emailService.sendSellerStatusEmail(u.getEmail(), u.getName(), "APPROVED");
        }
        return s;
    }

    @SuppressWarnings("unchecked")
    private void createRazorpayXContact(Seller s) {
        try {
            WebClient client = WebClient.builder()
                    .baseUrl("https://api.razorpay.com/v1")
                    .defaultHeaders(h -> h.setBasicAuth(razorpayKeyId, razorpayKeySecret))
                    .build();
            // Create contact
            Map<String, Object> contactBody = new HashMap<>();
            contactBody.put("name", s.getBusinessName());
            contactBody.put("email", s.getUser() != null ? s.getUser().getEmail() : "");
            contactBody.put("type", "vendor");
            Map<String, Object> contactResp = client.post().uri("/contacts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(contactBody)
                    .retrieve().bodyToMono(Map.class).block();
            if (contactResp == null || contactResp.get("id") == null) return;
            String contactId = (String) contactResp.get("id");
            s.setRazorpayContactId(contactId);
            // Create fund account
            Map<String, Object> bankAccount = new HashMap<>();
            bankAccount.put("name", s.getAccountHolderName());
            bankAccount.put("ifsc", s.getBankIfsc());
            bankAccount.put("account_number", s.getBankAccountNumber());
            Map<String, Object> fundBody = new HashMap<>();
            fundBody.put("contact_id", contactId);
            fundBody.put("account_type", "bank_account");
            fundBody.put("bank_account", bankAccount);
            Map<String, Object> fundResp = client.post().uri("/fund_accounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(fundBody)
                    .retrieve().bodyToMono(Map.class).block();
            if (fundResp != null && fundResp.get("id") != null) {
                s.setRazorpayFundAccountId((String) fundResp.get("id"));
            }
            sellerRepository.save(s);
            log.info("Razorpay X contact {} and fund account created for seller {}", contactId, s.getId());
        } catch (Exception e) {
            log.error("Failed to create Razorpay X contact for seller {}: {}", s.getId(), e.getMessage());
        }
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
}
