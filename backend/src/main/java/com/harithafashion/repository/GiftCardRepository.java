package com.harithafashion.repository;

import com.harithafashion.entity.GiftCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiftCardRepository extends JpaRepository<GiftCard, UUID> {

    Optional<GiftCard> findByCode(String code);

    Optional<GiftCard> findByCodeAndIsActiveTrue(String code);

    boolean existsByCode(String code);

    List<GiftCard> findByIssuedToUserId(UUID userId);

    @Query("SELECT gc FROM GiftCard gc WHERE gc.isActive = true AND gc.remainingAmount > 0 AND " +
           "(gc.expiresAt IS NULL OR gc.expiresAt >= :today)")
    List<GiftCard> findUsableGiftCards(@Param("today") LocalDate today);

    @Query("SELECT gc FROM GiftCard gc WHERE gc.issuedToUser.id = :userId AND gc.isActive = true AND " +
           "gc.remainingAmount > 0 AND (gc.expiresAt IS NULL OR gc.expiresAt >= :today)")
    List<GiftCard> findUsableGiftCardsByUserId(@Param("userId") UUID userId, @Param("today") LocalDate today);
}
