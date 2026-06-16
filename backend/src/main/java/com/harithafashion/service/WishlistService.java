package com.harithafashion.service;

import com.harithafashion.dto.request.AddToCartRequest;
import com.harithafashion.dto.response.ProductCardResponse;
import com.harithafashion.entity.*;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final CartService cartService;

    @Transactional(readOnly = true)
    public List<ProductCardResponse> getWishlist(UUID userId) {
        return wishlistRepository.findByUserId(userId)
                .map(w -> wishlistItemRepository.findProductIdsByWishlistId(w.getId()).stream()
                        .map(productService::getProductCard)
                        .toList())
                .orElse(List.of());
    }

    @Transactional
    public void addItem(UUID userId, UUID productId, String collectionName) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            return wishlistRepository.save(Wishlist.builder().user(user).build());
        });
        Product product = productRepository.findById(productId).orElseThrow();
        if (wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), productId)) return;
        wishlistItemRepository.save(WishlistItem.builder()
                .wishlist(wishlist).product(product)
                .collectionName(collectionName != null ? collectionName : "All")
                .priceAtAdd(product.getBasePrice()).build());
    }

    @Transactional
    public void removeItem(UUID userId, UUID productId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));
        wishlistItemRepository.deleteByWishlistIdAndProductId(wishlist.getId(), productId);
    }

    @Transactional
    public void moveToCart(UUID userId, UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
        ProductVariant variant = variantRepository.findByProductId(productId).stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .filter(v -> v.getStockQuantity() > v.getReservedQuantity())
                .findFirst()
                .orElseThrow(() -> new BadRequestException("This item is out of stock"));
        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(productId);
        req.setVariantId(variant.getId());
        req.setQuantity(1);
        cartService.addToCart(userId, req);
        wishlistRepository.findByUserId(userId).ifPresent(wishlist ->
                wishlistItemRepository.deleteByWishlistIdAndProductId(wishlist.getId(), productId));
    }
}
