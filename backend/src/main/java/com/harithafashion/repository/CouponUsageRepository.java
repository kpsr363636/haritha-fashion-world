package com.harithafashion.repository;

import com.harithafashion.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {

    List<CouponUsage> findByCouponId(UUID couponId);

    List<CouponUsage> findByUserId(UUID userId);

    List<CouponUsage> findByCouponIdAndUserId(UUID couponId, UUID userId);

    long countByCouponIdAndUserId(UUID couponId, UUID userId);

    long countByCouponId(UUID couponId);

    Optional<CouponUsage> findByOrderId(UUID orderId);

    boolean existsByCouponIdAndUserId(UUID couponId, UUID userId);
}
