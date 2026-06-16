package com.harithafashion.repository;

import com.harithafashion.entity.Seller;
import com.harithafashion.entity.enums.SellerStatus;
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
public interface SellerRepository extends JpaRepository<Seller, UUID> {

    Optional<Seller> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Optional<Seller> findByGstNumber(String gstNumber);

    List<Seller> findByStatus(SellerStatus status);

    Page<Seller> findByStatus(SellerStatus status, Pageable pageable);

    Page<Seller> findByStatusAndKycVerified(SellerStatus status, Boolean kycVerified, Pageable pageable);

    List<Seller> findByPendingPayoutGreaterThan(BigDecimal amount);

    @Query("SELECT s FROM Seller s WHERE LOWER(s.businessName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Seller> searchByBusinessName(@Param("keyword") String keyword, Pageable pageable);
}
