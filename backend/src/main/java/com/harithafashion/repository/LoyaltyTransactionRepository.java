package com.harithafashion.repository;

import com.harithafashion.entity.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, UUID> {

    Page<LoyaltyTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<LoyaltyTransaction> findByUserIdAndType(UUID userId, String type);

    List<LoyaltyTransaction> findByOrderId(UUID orderId);

    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE lt.user.id = :userId AND lt.type = :type")
    Integer sumPointsByUserIdAndType(@Param("userId") UUID userId, @Param("type") String type);

    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE lt.user.id = :userId AND lt.expiresAt IS NOT NULL AND lt.expiresAt < :today")
    List<LoyaltyTransaction> findExpiredByUserId(@Param("userId") UUID userId, @Param("today") LocalDate today);
}
