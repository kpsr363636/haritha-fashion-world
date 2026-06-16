package com.harithafashion.service;

import com.harithafashion.dto.response.PageResponse;
import com.harithafashion.dto.response.SellerOrderItemResponse;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.SellerStatus;
import com.harithafashion.entity.enums.UserRole;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Seller register(UUID userId, Map<String, String> req) {
        if (sellerRepository.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Already registered as seller");
        }
        User user = userRepository.findById(userId).orElseThrow();
        user.setRole(UserRole.SELLER);
        userRepository.save(user);
        return sellerRepository.save(Seller.builder()
                .user(user).businessName(req.get("businessName"))
                .businessType(req.get("businessType")).gstNumber(req.get("gstNumber"))
                .panNumber(req.get("panNumber")).bankAccountNumber(req.get("bankAccountNumber"))
                .bankIfsc(req.get("bankIfsc") != null ? req.get("bankIfsc") : req.get("ifscCode"))
                .status(SellerStatus.PENDING).build());
    }

    public Map<String, Object> dashboard(UUID userId) {
        Seller seller = sellerRepository.findByUserId(userId).orElseThrow();
        long products = productRepository.countBySellerId(seller.getId());
        long orders = orderItemRepository.countBySellerIdAndStatus(seller.getId(),
                com.harithafashion.entity.enums.OrderStatus.PLACED);
        Map<String, Object> m = new HashMap<>();
        m.put("totalSales", seller.getTotalSales());
        m.put("pendingPayout", seller.getPendingPayout());
        m.put("productCount", products);
        m.put("orderCount", orders);
        m.put("avgRating", seller.getAvgRating());
        return m;
    }

    public Seller getByUserId(UUID userId) {
        return sellerRepository.findByUserId(userId).orElseThrow();
    }

    @Transactional(readOnly = true)
    public PageResponse<SellerOrderItemResponse> listOrders(UUID userId, int page, int size) {
        Seller seller = getByUserId(userId);
        Page<OrderItem> items = orderItemRepository.findBySellerId(seller.getId(), PageRequest.of(page, size));
        List<SellerOrderItemResponse> content = items.getContent().stream().map(item -> {
            Order order = orderRepository.findById(item.getOrder().getId()).orElseThrow();
            return SellerOrderItemResponse.builder()
                    .id(item.getId())
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .productName(item.getProductName())
                    .variantInfo(item.getVariantInfo())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .status(item.getStatus() != null ? item.getStatus().name() : order.getStatus().name())
                    .placedAt(order.getPlacedAt())
                    .build();
        }).collect(Collectors.toList());
        return PageResponse.<SellerOrderItemResponse>builder()
                .content(content)
                .totalElements(items.getTotalElements())
                .totalPages(items.getTotalPages())
                .page(page)
                .size(size)
                .build();
    }
}
