package com.harithafashion.repository;

import com.harithafashion.entity.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, UUID> {

    List<StockAlert> findByUserId(UUID userId);

    List<StockAlert> findByUserIdAndNotifiedFalse(UUID userId);

    Optional<StockAlert> findByUserIdAndProductIdAndVariantId(UUID userId, UUID productId, UUID variantId);

    List<StockAlert> findByProductIdAndVariantIdAndNotifiedFalse(UUID productId, UUID variantId);

    boolean existsByUserIdAndProductIdAndVariantId(UUID userId, UUID productId, UUID variantId);

    boolean existsByUserIdAndVariantId(UUID userId, UUID variantId);

    List<StockAlert> findByVariantIdAndNotifiedFalse(UUID variantId);
}
