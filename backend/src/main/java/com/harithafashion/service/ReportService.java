package com.harithafashion.service;

import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final AbandonedCartRepository abandonedCartRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final SellerRepository sellerRepository;

    public Map<String, Object> salesReport(LocalDateTime from, LocalDateTime to) {
        var orders = orderRepository.findSalesOrders(from, to);
        BigDecimal gmv = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> m = new HashMap<>();
        m.put("orderCount", orders.size());
        m.put("gmv", gmv);
        m.put("from", from);
        m.put("to", to);
        return m;
    }

    public Map<String, Object> abandonedCartReport() {
        Map<String, Object> m = new HashMap<>();
        m.put("unrecoveredCount", abandonedCartRepository.countUnrecoveredSince(LocalDateTime.now().minusDays(30)));
        return m;
    }

    public Map<String, Object> returnsReport() {
        Map<String, Object> m = new HashMap<>();
        m.put("pending", returnRequestRepository.findByStatusOrderByCreatedAtDesc("REQUESTED",
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements());
        return m;
    }

    public Map<String, Object> couponReport() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalUsages", couponUsageRepository.count());
        return m;
    }

    public Map<String, Object> sellerReport() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalSellers", sellerRepository.count());
        m.put("approvedSellers", sellerRepository.findByStatus(
                com.harithafashion.entity.enums.SellerStatus.APPROVED).size());
        return m;
    }

    public Map<String, Object> topProductsReport() {
        Map<String, Object> m = new HashMap<>();
        m.put("products", productRepository.findTop10ByStatusOrderByCreatedAtDesc(
                com.harithafashion.entity.enums.ProductStatus.ACTIVE));
        return m;
    }
}
