package com.harithafashion.repository;

import com.harithafashion.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUserId(UUID userId);

    @Query("""
            SELECT DISTINCT c FROM Cart c
            LEFT JOIN FETCH c.items ci
            LEFT JOIN FETCH ci.product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH ci.variant
            WHERE c.user.id = :userId
            """)
    Optional<Cart> findByUserIdWithDetails(@Param("userId") UUID userId);

    @Query("SELECT c FROM Cart c JOIN FETCH c.items WHERE c.updatedAt < :cutoff AND SIZE(c.items) > 0")
    List<Cart> findStaleCartsWithItems(@Param("cutoff") LocalDateTime cutoff);
}
