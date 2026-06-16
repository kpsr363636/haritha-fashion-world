package com.harithafashion.repository;

import com.harithafashion.entity.Refund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {

    List<Refund> findByOrderIdOrderByCreatedAtDesc(UUID orderId);

    List<Refund> findByOrderItemId(UUID orderItemId);

    Optional<Refund> findByRazorpayRefundId(String razorpayRefundId);

    List<Refund> findByStatus(String status);

    Page<Refund> findByStatus(String status, Pageable pageable);

    List<Refund> findByPaymentId(UUID paymentId);
}
