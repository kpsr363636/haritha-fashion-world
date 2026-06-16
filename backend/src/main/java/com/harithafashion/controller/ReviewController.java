package com.harithafashion.controller;

import com.harithafashion.dto.request.ReviewRequest;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.entity.Review;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviews/product/{productId}")
    public ApiResponse<Page<Review>> list(@PathVariable UUID productId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(reviewService.getProductReviews(productId, page, size));
    }

    @GetMapping("/reviews/product/{productId}/breakdown")
    public ApiResponse<Map<String, Long>> breakdown(@PathVariable UUID productId) {
        return ApiResponse.ok(reviewService.getRatingBreakdown(productId));
    }

    @PostMapping("/reviews")
    public ApiResponse<Review> create(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody ReviewRequest req) {
        return ApiResponse.ok(reviewService.createReview(p.getId(), req));
    }

    @PostMapping("/reviews/{id}/helpful")
    public ApiResponse<Void> helpful(@PathVariable UUID id) {
        reviewService.markHelpful(id);
        return ApiResponse.ok(null);
    }
}
