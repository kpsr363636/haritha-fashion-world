package com.harithafashion.service;

import com.harithafashion.dto.request.ReviewRequest;
import com.harithafashion.entity.*;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public Page<Review> getProductReviews(UUID productId, int page, int size) {
        return reviewRepository.findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(
                productId, PageRequest.of(page, size));
    }

    public Map<String, Long> getRatingBreakdown(UUID productId) {
        return Map.of(
                "5", reviewRepository.countByProductIdAndRating(productId, 5),
                "4", reviewRepository.countByProductIdAndRating(productId, 4),
                "3", reviewRepository.countByProductIdAndRating(productId, 3),
                "2", reviewRepository.countByProductIdAndRating(productId, 2),
                "1", reviewRepository.countByProductIdAndRating(productId, 1));
    }

    @Transactional
    public Review createReview(UUID userId, ReviewRequest req) {
        OrderItem orderItem = orderItemRepository.findById(req.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));
        if (!orderItem.getOrder().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not your order");
        }
        if (Boolean.TRUE.equals(orderItem.getIsReviewed())) {
            throw new BadRequestException("Already reviewed");
        }
        User user = userRepository.findById(userId).orElseThrow();
        Product product = orderItem.getProduct();
        Review review = Review.builder()
                .product(product).user(user).orderItem(orderItem)
                .rating(req.getRating()).title(req.getTitle()).body(req.getBody())
                .images(req.getImages()).isVerifiedPurchase(true).isApproved(true).build();
        reviewRepository.save(review);
        orderItem.setIsReviewed(true);
        orderItemRepository.save(orderItem);
        updateProductRating(product.getId());
        return review;
    }

    @Transactional
    public void markHelpful(UUID reviewId) {
        reviewRepository.findById(reviewId).ifPresent(r -> {
            r.setHelpfulCount(r.getHelpfulCount() + 1);
            reviewRepository.save(r);
        });
    }

    @Transactional
    public Review sellerReply(UUID reviewId, UUID sellerUserId, String reply) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        review.setSellerReply(reply);
        review.setSellerRepliedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @Transactional
    public Review approveReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        review.setIsApproved(true);
        updateProductRating(review.getProduct().getId());
        return reviewRepository.save(review);
    }

    public Page<Review> listPending(int page, int size) {
        return reviewRepository.findByIsApprovedFalseOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    private void updateProductRating(UUID productId) {
        productRepository.findById(productId).ifPresent(p -> {
            Double avg = reviewRepository.avgRatingByProductId(productId);
            long count = reviewRepository.countByProductIdAndIsApprovedTrue(productId);
            p.setAvgRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            p.setReviewCount((int) count);
            productRepository.save(p);
        });
    }
}
