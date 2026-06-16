package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.PageResponse;
import com.harithafashion.dto.response.ProductCardResponse;
import com.harithafashion.dto.response.ProductDetailResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.ProductService;
import com.harithafashion.service.RecentlyViewedService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final RecentlyViewedService recentlyViewedService;

    @GetMapping
    public ApiResponse<PageResponse<ProductCardResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "RELEVANCE") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(productService.searchProducts(q, category, minPrice, maxPrice, minRating, sort, page, size));
    }

    @GetMapping("/featured")
    public ApiResponse<List<ProductCardResponse>> featured() {
        return ApiResponse.ok(productService.getFeatured());
    }

    @GetMapping("/new-arrivals")
    public ApiResponse<List<ProductCardResponse>> newArrivals() {
        return ApiResponse.ok(productService.getNewArrivals());
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getBySlug(@PathVariable String slug,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        ProductDetailResponse detail = productService.getProductBySlug(slug);
        if (principal != null) {
            recentlyViewedService.trackView(principal.getId(), detail.getId());
        }
        return ApiResponse.ok(detail);
    }

    @GetMapping("/{id}/complete-the-look")
    public ApiResponse<List<ProductCardResponse>> completeTheLook(@PathVariable UUID id) {
        return ApiResponse.ok(productService.getCompleteTheLook(id));
    }

    @GetMapping("/pincode/{pincode}/serviceability")
    public ApiResponse<Map<String, Object>> serviceability(@PathVariable String pincode) {
        return ApiResponse.ok(productService.getPincodeServiceability(pincode));
    }
}
