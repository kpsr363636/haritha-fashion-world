package com.harithafashion.repository;

import com.harithafashion.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {

    List<WishlistItem> findByWishlistIdOrderByAddedAtDesc(UUID wishlistId);

    List<WishlistItem> findByWishlistIdAndCollectionNameOrderByAddedAtDesc(UUID wishlistId, String collectionName);

    Optional<WishlistItem> findByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    boolean existsByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    long countByWishlistId(UUID wishlistId);

    void deleteByWishlistIdAndProductId(UUID wishlistId, UUID productId);

    @Query("SELECT wi.product.id FROM WishlistItem wi WHERE wi.wishlist.id = :wishlistId ORDER BY wi.addedAt DESC")
    List<UUID> findProductIdsByWishlistId(@Param("wishlistId") UUID wishlistId);
}
