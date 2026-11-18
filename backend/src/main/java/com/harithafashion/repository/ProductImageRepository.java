package com.harithafashion.repository;

import com.harithafashion.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(UUID productId);

    /** Prefer list query — multiple rows may be marked primary in legacy data. */
    List<ProductImage> findByProductIdAndIsPrimaryTrueOrderBySortOrderAsc(UUID productId);

    default Optional<ProductImage> findPrimaryForProduct(UUID productId) {
        List<ProductImage> primaries = findByProductIdAndIsPrimaryTrueOrderBySortOrderAsc(productId);
        if (!primaries.isEmpty()) return Optional.of(primaries.get(0));
        return findByProductIdOrderBySortOrderAsc(productId).stream().findFirst();
    }

    @Deprecated
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(UUID productId);

    long countByProductId(UUID productId);

    void deleteByProductId(UUID productId);

    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = false WHERE pi.product.id = :productId AND pi.isPrimary = true")
    void clearPrimaryForProduct(@Param("productId") UUID productId);
}
