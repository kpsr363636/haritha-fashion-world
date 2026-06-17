package com.harithafashion.repository;

import com.harithafashion.entity.Order;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    Page<Order> findByUserIdOrderByPlacedAtDesc(UUID userId, Pageable pageable);

    Page<Order> findByUserIdAndStatusOrderByPlacedAtDesc(UUID userId, OrderStatus status, Pageable pageable);

    Page<Order> findByStatusOrderByPlacedAtDesc(OrderStatus status, Pageable pageable);

    Page<Order> findByPaymentStatusOrderByPlacedAtDesc(PaymentStatus paymentStatus, Pageable pageable);

    List<Order> findByUserIdAndStatusIn(UUID userId, List<OrderStatus> statuses);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, OrderStatus status);

    boolean existsByUserId(UUID userId);

    boolean existsByUserIdAndPlacedAtAfter(UUID userId, LocalDateTime after);

    Page<Order> findByPlacedAtBetweenOrderByPlacedAtDesc(LocalDateTime from, LocalDateTime to, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status NOT IN " +
           "(com.harithafashion.entity.enums.OrderStatus.CANCELLED, " +
           "com.harithafashion.entity.enums.OrderStatus.RETURNED) ORDER BY o.placedAt DESC")
    Page<Order> findActiveOrdersByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    BigDecimal sumTotalAmountByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Order> searchByOrderNumber(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.placedAt BETWEEN :from AND :to AND o.status <> com.harithafashion.entity.enums.OrderStatus.CANCELLED")
    List<Order> findSalesOrders(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.harithafashion.entity.enums.OrderStatus.CANCELLED")
    BigDecimal sumTotalRevenue();
}
