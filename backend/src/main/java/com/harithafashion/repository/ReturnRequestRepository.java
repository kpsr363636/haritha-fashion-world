package com.harithafashion.repository;

import com.harithafashion.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> {

    Page<ReturnRequest> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<ReturnRequest> findByOrderIdOrderByCreatedAtDesc(UUID orderId);

    Optional<ReturnRequest> findByOrderItemId(UUID orderItemId);

    Page<ReturnRequest> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    List<ReturnRequest> findByUserIdAndStatus(UUID userId, String status);

    boolean existsByOrderItemIdAndStatusIn(UUID orderItemId, List<String> statuses);

    long countByUserId(UUID userId);
}
