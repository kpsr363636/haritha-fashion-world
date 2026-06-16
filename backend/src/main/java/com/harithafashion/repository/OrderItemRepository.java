package com.harithafashion.repository;

import com.harithafashion.entity.OrderItem;
import com.harithafashion.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    Page<OrderItem> findBySellerId(UUID sellerId, Pageable pageable);

    Page<OrderItem> findBySellerIdAndStatus(UUID sellerId, OrderStatus status, Pageable pageable);

    List<OrderItem> findByOrderIdAndIsReviewedFalse(UUID orderId);

    Optional<OrderItem> findByIdAndOrderId(UUID id, UUID orderId);

    long countBySellerIdAndStatus(UUID sellerId, OrderStatus status);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.isReviewed = false AND " +
           "oi.status = com.harithafashion.entity.enums.OrderStatus.DELIVERED")
    List<OrderItem> findUnreviewedDeliveredByUserId(@Param("userId") UUID userId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.returnWindowUntil >= :today AND oi.order.user.id = :userId AND " +
           "oi.status = com.harithafashion.entity.enums.OrderStatus.DELIVERED")
    List<OrderItem> findReturnEligibleByUserId(@Param("userId") UUID userId, @Param("today") LocalDate today);
}
