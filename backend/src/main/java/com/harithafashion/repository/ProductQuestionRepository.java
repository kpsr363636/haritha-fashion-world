package com.harithafashion.repository;

import com.harithafashion.entity.ProductQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, UUID> {

    Page<ProductQuestion> findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Page<ProductQuestion> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Page<ProductQuestion> findByProductIdAndIsApprovedFalseOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Page<ProductQuestion> findByIsApprovedFalseOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT q FROM ProductQuestion q WHERE q.product.seller.id = :sellerId ORDER BY q.createdAt DESC")
    Page<ProductQuestion> findBySellerId(@Param("sellerId") UUID sellerId, Pageable pageable);

    long countByProductIdAndIsApprovedTrue(UUID productId);

    long countByProductId(UUID productId);
}
