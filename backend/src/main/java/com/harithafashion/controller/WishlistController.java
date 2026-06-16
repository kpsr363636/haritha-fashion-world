package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.ProductCardResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<ProductCardResponse>> get(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(wishlistService.getWishlist(p.getId()));
    }

    @PostMapping("/items")
    public ApiResponse<Void> add(@AuthenticationPrincipal UserPrincipal p, @RequestBody Map<String, String> body) {
        wishlistService.addItem(p.getId(), UUID.fromString(body.get("productId")), body.get("collectionName"));
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<Void> remove(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID productId) {
        wishlistService.removeItem(p.getId(), productId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/items/{productId}/move-to-cart")
    public ApiResponse<Void> moveToCart(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID productId) {
        wishlistService.moveToCart(p.getId(), productId);
        return ApiResponse.ok(null);
    }
}
