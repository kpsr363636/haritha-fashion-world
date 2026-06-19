package com.harithafashion.repository;

import com.harithafashion.entity.Product;
import com.harithafashion.entity.enums.ProductStatus;
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
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller WHERE p.id = :id")
    Optional<Product> findByIdWithSeller(@Param("id") UUID id);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    Page<Product> findByIsFeaturedTrueAndStatus(ProductStatus status, Pageable pageable);
    Page<Product> findBySellerId(UUID sellerId, Pageable pageable);
    Page<Product> findBySellerIdAndStatus(UUID sellerId, ProductStatus status, Pageable pageable);
    long countBySellerId(UUID sellerId);
    List<Product> findTop10ByStatusOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findTop10ByStatusOrderByTotalSoldDesc(ProductStatus status);

    @Query(value = """
            SELECT p.* FROM products p
            WHERE p.status = 'ACTIVE'
            AND (:query IS NULL OR p.search_vector @@ plainto_tsquery('english', :query))
            AND (CAST(:categoryIds AS uuid[]) IS NULL OR p.category_id = ANY(CAST(:categoryIds AS uuid[])))
            AND (CAST(:minPrice AS numeric) IS NULL OR p.base_price * (1 - p.discount_percent/100) >= :minPrice)
            AND (CAST(:maxPrice AS numeric) IS NULL OR p.base_price * (1 - p.discount_percent/100) <= :maxPrice)
            AND (CAST(:minRating AS numeric) IS NULL OR p.avg_rating >= :minRating)
            ORDER BY CASE WHEN :sortBy = 'PRICE_ASC' THEN p.base_price END ASC,
                     CASE WHEN :sortBy = 'PRICE_DESC' THEN p.base_price END DESC,
                     CASE WHEN :sortBy = 'NEWEST' THEN p.created_at END DESC,
                     CASE WHEN :sortBy = 'RATING' THEN p.avg_rating END DESC,
                     CASE WHEN :sortBy = 'POPULARITY' THEN p.total_sold END DESC,
                     ts_rank(p.search_vector, plainto_tsquery('english', COALESCE(:query, ''))) DESC
            """, nativeQuery = true, countQuery = """
            SELECT count(*) FROM products p
            WHERE p.status = 'ACTIVE'
            AND (:query IS NULL OR p.search_vector @@ plainto_tsquery('english', :query))
            AND (CAST(:categoryIds AS uuid[]) IS NULL OR p.category_id = ANY(CAST(:categoryIds AS uuid[])))
            AND (CAST(:minPrice AS numeric) IS NULL OR p.base_price * (1 - p.discount_percent/100) >= :minPrice)
            AND (CAST(:maxPrice AS numeric) IS NULL OR p.base_price * (1 - p.discount_percent/100) <= :maxPrice)
            AND (CAST(:minRating AS numeric) IS NULL OR p.avg_rating >= :minRating)
            """)
    Page<Product> searchProducts(
            @Param("query") String query,
            @Param("categoryIds") UUID[] categoryIds,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("sortBy") String sortBy,
            Pageable pageable);
}
