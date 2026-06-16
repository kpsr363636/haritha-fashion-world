package com.harithafashion.service;

import com.harithafashion.dto.response.*;
import com.harithafashion.entity.Product;
import com.harithafashion.entity.Category;
import com.harithafashion.entity.ProductImage;
import com.harithafashion.entity.ProductVariant;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.harithafashion.util.PincodeValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductVideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final CompleteTheLookRepository completeTheLookRepository;

    @Value("${shiprocket.base-url}")
    private String shiprocketBaseUrl;

    @Value("${shiprocket.pickup-location:Primary}")
    private String pickupLocation;

    @Transactional(readOnly = true)
    public PageResponse<ProductCardResponse> searchProducts(
            String query, String category, BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, String sortBy, int page, int size) {

        if (query != null && query.isBlank()) {
            query = null;
        }
        UUID categoryId = resolveCategoryId(category);
        UUID[] categoryIds = null;
        if (categoryId != null) {
            categoryIds = categoryRepository.findCategoryTreeIds(categoryId).toArray(new UUID[0]);
        }
        String sort = mapSortBy(sortBy);
        Page<Product> results = productRepository.searchProducts(
                query, categoryIds, minPrice, maxPrice, minRating, sort, PageRequest.of(page, size));

        List<ProductCardResponse> content = results.getContent().stream()
                .map(this::toCard).toList();

        return PageResponse.<ProductCardResponse>builder()
                .content(content)
                .totalElements(results.getTotalElements())
                .totalPages(results.getTotalPages())
                .page(page)
                .size(size)
                .build();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toDetail(product);
    }

    @Transactional(readOnly = true)
    public List<ProductCardResponse> getFeatured() {
        return productRepository.findByIsFeaturedTrueAndStatus(ProductStatus.ACTIVE, PageRequest.of(0, 12))
                .map(this::toCard).getContent();
    }

    @Transactional(readOnly = true)
    public List<ProductCardResponse> getNewArrivals() {
        return productRepository.findTop10ByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                .stream().map(this::toCard).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductCardResponse> getCompleteTheLook(UUID productId) {
        List<Product> suggestions = completeTheLookRepository
                .findByPrimaryProductIdOrderBySortOrderAsc(productId)
                .stream()
                .map(ct -> ct.getSuggestedProduct())
                .limit(4)
                .toList();
        if (suggestions.isEmpty()) {
            Product product = productRepository.findById(productId).orElse(null);
            if (product != null && product.getCategory() != null) {
                suggestions = productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(0, 4)).getContent();
            }
        }
        return suggestions.stream().map(this::toCard).toList();
    }

    public Map<String, Object> getPincodeServiceability(String pincode) {
        if (!PincodeValidator.isValid(pincode)) {
            return Map.of("serviceable", false, "message", "Invalid pincode");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("serviceable", true);
        result.put("estimatedDays", 3);
        result.put("courierOptions", List.of(
                Map.of("name", "Delhivery", "rate", 0, "etd", "3-5 days"),
                Map.of("name", "BlueDart", "rate", 49, "etd", "2-4 days")));
        return result;
    }

    @Transactional(readOnly = true)
    public ProductCardResponse getProductCard(UUID productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toCard(p);
    }

    private ProductCardResponse toCard(Product p) {
        BigDecimal finalPrice = calcFinalPrice(p.getBasePrice(), p.getDiscountPercent());
        String imageUrl = imageRepository.findByProductIdAndIsPrimaryTrue(p.getId())
                .map(ProductImage::getImageUrl)
                .or(() -> imageRepository.findByProductIdOrderBySortOrderAsc(p.getId()).stream()
                        .findFirst()
                        .map(ProductImage::getImageUrl))
                .orElse(null);
        boolean inStock = variantRepository.findByProductId(p.getId()).stream()
                .anyMatch(v -> v.getStockQuantity() - v.getReservedQuantity() > 0);
        String categoryName = resolveCategoryName(p);
        return ProductCardResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .basePrice(p.getBasePrice())
                .mrp(p.getMrp())
                .discountPercent(p.getDiscountPercent())
                .finalPrice(finalPrice)
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .primaryImageUrl(imageUrl)
                .categoryName(categoryName)
                .inStock(inStock)
                .build();
    }

    private ProductDetailResponse toDetail(Product p) {
        List<ProductVariant> variants = variantRepository.findByProductId(p.getId());
        List<ProductImage> images = imageRepository.findByProductIdOrderBySortOrderAsc(p.getId());
        String videoUrl = videoRepository.findByProductIdOrderByCreatedAtAsc(p.getId()).stream()
                .findFirst().map(v -> v.getVideoUrl()).orElse(null);

        return ProductDetailResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .fabric(p.getFabric())
                .occasion(p.getOccasion())
                .careInstructions(p.getCareInstructions())
                .basePrice(p.getBasePrice())
                .mrp(p.getMrp())
                .discountPercent(p.getDiscountPercent())
                .finalPrice(calcFinalPrice(p.getBasePrice(), p.getDiscountPercent()))
                .gstPercent(p.getGstPercent())
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .isCodAvailable(p.getIsCodAvailable())
                .isReturnable(p.getIsReturnable())
                .returnWindowDays(p.getReturnWindowDays())
                .sellerName(p.getSeller() != null ? p.getSeller().getBusinessName() : null)
                .sellerRating(p.getSeller() != null ? p.getSeller().getAvgRating() : null)
                .variants(variants.stream().map(v -> ProductVariantResponse.builder()
                        .id(v.getId()).size(v.getSize()).color(v.getColor())
                        .colorHex(v.getColorHex()).stockQuantity(v.getStockQuantity() - v.getReservedQuantity())
                        .additionalPrice(v.getAdditionalPrice()).sku(v.getSku()).isActive(v.getIsActive()).build()).toList())
                .images(images.stream().map(img -> ProductImageResponse.builder()
                        .id(img.getId()).imageUrl(img.getImageUrl()).thumbnailUrl(img.getThumbnailUrl())
                        .altText(img.getAltText()).isPrimary(img.getIsPrimary()).build()).toList())
                .videoUrl(videoUrl)
                .build();
    }

    private BigDecimal calcFinalPrice(BigDecimal base, BigDecimal discount) {
        if (discount == null || discount.compareTo(BigDecimal.ZERO) == 0) return base;
        return base.multiply(BigDecimal.ONE.subtract(discount.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private UUID resolveCategoryId(String category) {
        if (category == null || category.isBlank()) return null;
        try {
            return UUID.fromString(category);
        } catch (IllegalArgumentException e) {
            return categoryRepository.findBySlug(category).map(Category::getId).orElse(null);
        }
    }

    private String resolveCategoryName(Product p) {
        if (p.getCategory() == null) return null;
        UUID categoryId = p.getCategory().getId();
        return categoryRepository.findById(categoryId).map(Category::getName).orElse(null);
    }

    private String mapSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) return "RELEVANCE";
        return switch (sortBy) {
            case "PRICE_LOW" -> "PRICE_ASC";
            case "PRICE_HIGH" -> "PRICE_DESC";
            case "POPULAR" -> "POPULARITY";
            default -> sortBy;
        };
    }
}
