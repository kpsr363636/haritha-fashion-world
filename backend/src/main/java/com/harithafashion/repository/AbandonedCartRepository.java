package com.harithafashion.repository;

import com.harithafashion.entity.AbandonedCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbandonedCartRepository extends JpaRepository<AbandonedCart, UUID> {

    List<AbandonedCart> findByUserIdOrderByAbandonedAtDesc(UUID userId);

    Optional<AbandonedCart> findTopByUserIdAndRecoveredFalseOrderByAbandonedAtDesc(UUID userId);

    Optional<AbandonedCart> findByUserId(UUID userId);

    List<AbandonedCart> findByRecoveredFalseAndReminder1hSentFalseAndAbandonedAtBefore(LocalDateTime cutoff);

    List<AbandonedCart> findByRecoveredFalseAndReminder24hSentFalseAndAbandonedAtBefore(LocalDateTime cutoff);

    @Query("SELECT COUNT(ac) FROM AbandonedCart ac WHERE ac.recovered = false AND ac.abandonedAt >= :since")
    long countUnrecoveredSince(@Param("since") LocalDateTime since);
}
