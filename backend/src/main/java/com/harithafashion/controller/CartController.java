package com.harithafashion.controller;

import com.harithafashion.dto.request.AddToCartRequest;
import com.harithafashion.dto.request.UpdateCartItemRequest;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.CartResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(cartService.getCartWithDetails(principal.getId()));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        return ApiResponse.ok(cartService.addToCart(principal.getId(), request));
    }

    @PutMapping("/items/{id}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.ok(cartService.updateCartItem(principal.getId(), id, request.getQuantity()));
    }

    @DeleteMapping("/items/{id}")
    public ApiResponse<CartResponse> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(cartService.removeFromCart(principal.getId(), id));
    }

    @DeleteMapping
    public ApiResponse<CartResponse> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(cartService.clearCart(principal.getId()));
    }
}
