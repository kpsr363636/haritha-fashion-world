package com.harithafashion.repository;

import com.harithafashion.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Page<Review> findByProductIdAndUserId(UUID productId, UUID userId, Pageable pageable);

    Optional<Review> findByOrderItemId(UUID orderItemId);

    boolean existsByOrderItemId(UUID orderItemId);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    Page<Review> findByProductIdAndIsApprovedFalseOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Page<Review> findByIsApprovedFalseOrderByCreatedAtDesc(Pageable pageable);

    long countByProductIdAndIsApprovedTrue(UUID productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isApproved = true")
    Double avgRatingByProductId(@Param("productId") UUID productId);

    long countByProductIdAndRating(UUID productId, int rating);

    @Query("SELECT r FROM Review r WHERE r.product.seller.id = :sellerId AND r.isApproved = true ORDER BY r.createdAt DESC")
    Page<Review> findBySellerId(@Param("sellerId") UUID sellerId, Pageable pageable);
}
