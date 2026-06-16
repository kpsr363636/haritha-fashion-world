package com.harithafashion.repository;

import com.harithafashion.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    boolean existsByCode(String code);

    List<Coupon> findByIsActiveTrue();

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND " +
           "(c.validFrom IS NULL OR c.validFrom <= :now) AND " +
           "(c.validUntil IS NULL OR c.validUntil >= :now)")
    List<Coupon> findCurrentlyValidCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.isReferralCoupon = true")
    List<Coupon> findActiveReferralCoupons();
}
