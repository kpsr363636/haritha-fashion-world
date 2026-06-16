package com.harithafashion.repository;

import com.harithafashion.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, UUID> {

    List<StockReservation> findByVariantId(UUID variantId);

    List<StockReservation> findByUserId(UUID userId);

    Optional<StockReservation> findByVariantIdAndUserId(UUID variantId, UUID userId);

    List<StockReservation> findByOrderId(UUID orderId);

    List<StockReservation> findByExpiresAtBefore(LocalDateTime expiresAt);

    @Modifying
    @Query("DELETE FROM StockReservation sr WHERE sr.expiresAt < :now AND sr.orderId IS NULL")
    int deleteExpiredUnlinkedReservations(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(sr.quantity), 0) FROM StockReservation sr WHERE sr.variant.id = :variantId AND sr.expiresAt > :now")
    int sumActiveReservedQuantity(@Param("variantId") UUID variantId, @Param("now") LocalDateTime now);
}
