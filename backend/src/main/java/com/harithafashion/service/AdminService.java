package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.SellerStatus;
import com.harithafashion.entity.enums.UserRole;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
}
