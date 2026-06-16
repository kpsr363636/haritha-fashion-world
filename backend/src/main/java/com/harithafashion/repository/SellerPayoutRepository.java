package com.harithafashion.repository;

import com.harithafashion.entity.SellerPayout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SellerPayoutRepository extends JpaRepository<SellerPayout, UUID> {

    List<SellerPayout> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);

    Page<SellerPayout> findBySellerId(UUID sellerId, Pageable pageable);

    List<SellerPayout> findBySellerIdAndStatus(UUID sellerId, String status);

    List<SellerPayout> findByStatus(String status);

    Page<SellerPayout> findByStatus(String status, Pageable pageable);

    Optional<SellerPayout> findByRazorpayPayoutId(String razorpayPayoutId);

    @Query("SELECT COALESCE(SUM(sp.amount), 0) FROM SellerPayout sp WHERE sp.seller.id = :sellerId AND sp.status = :status")
    BigDecimal sumAmountBySellerIdAndStatus(@Param("sellerId") UUID sellerId, @Param("status") String status);
}
