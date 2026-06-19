package com.harithafashion.service;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.*;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SellerProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ProductVideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final ProductService productService;
    private final StockAlertService stockAlertService;

    @Transactional(readOnly = true)
    public PageResponse<ProductCardResponse> listMyProducts(UUID userId, int page, int size, ProductStatus status) {
        Seller seller = sellerRepository.findByUserId(userId).orElseThrow();
        Page<Product> p = status != null
                ? productRepository.findBySellerIdAndStatus(seller.getId(), status, PageRequest.of(page, size))
                : productRepository.findBySellerId(seller.getId(), PageRequest.of(page, size));
        var cards = p.getContent().stream().map(pr -> productService.getProductCard(pr.getId())).toList();
        return PageResponse.of(cards, p.getTotalElements(), p.getTotalPages(), p.getNumber(), p.getSize());
    }

    public Product getMyProduct(UUID userId, UUID productId) {
        return verifyOwnership(userId, productId);
    }

    public ProductDetailResponse getMyProductDetail(UUID userId, UUID productId) {
        verifyOwnership(userId, productId);
        return productService.getProductByIdForAdmin(productId);
    }

    @Transactional
    public ProductCardResponse createProduct(UUID userId, CreateProductRequest req) {
        Seller seller = sellerRepository.findByUserId(userId).orElseThrow();
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        String slug = uniqueSlug(req.getName());
        Product product = Product.builder()
                .seller(seller).category(category).name(req.getName()).slug(slug)
                .description(req.getDescription()).fabric(req.getFabric()).occasion(req.getOccasion())
                .basePrice(req.getBasePrice()).mrp(req.getMrp())
                .discountPercent(req.getDiscountPercent() != null ? req.getDiscountPercent() : BigDecimal.ZERO)
                .gstPercent(req.getGstPercent() != null ? req.getGstPercent() : new BigDecimal("5.00"))
                .status(ProductStatus.DRAFT)
                .isCodAvailable(req.getIsCodAvailable() != null ? req.getIsCodAvailable() : true)
                .isReturnable(req.getIsReturnable() != null ? req.getIsReturnable() : true)
                .returnWindowDays(req.getReturnWindowDays() != null ? req.getReturnWindowDays() : 7)
                .build();
        product = productRepository.save(product);
        if (req.getVariants() != null) {
            for (ProductVariantRequest vr : req.getVariants()) {
                addVariantInternal(product, vr);
            }
        }
        if (req.getImages() != null) {
            int i = 0;
            for (ProductImageRequest ir : req.getImages()) {
                addImageInternal(product, ir, i++);
            }
        }
        return productService.getProductCard(product.getId());
    }

    @Transactional
    public ProductCardResponse updateProduct(UUID userId, UUID productId, UpdateProductRequest req) {
        Product product = verifyOwnership(userId, productId);
        if (req.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(req.getCategoryId()).orElseThrow());
        }
        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getFabric() != null) product.setFabric(req.getFabric());
        if (req.getOccasion() != null) product.setOccasion(req.getOccasion());
        if (req.getBasePrice() != null) product.setBasePrice(req.getBasePrice());
        if (req.getMrp() != null) product.setMrp(req.getMrp());
        if (req.getDiscountPercent() != null) product.setDiscountPercent(req.getDiscountPercent());
        if (req.getGstPercent() != null) product.setGstPercent(req.getGstPercent());
        if (req.getIsCodAvailable() != null) product.setIsCodAvailable(req.getIsCodAvailable());
        if (req.getIsReturnable() != null) product.setIsReturnable(req.getIsReturnable());
        if (req.getReturnWindowDays() != null) product.setReturnWindowDays(req.getReturnWindowDays());
        productRepository.save(product);
        return productService.getProductCard(productId);
    }

    @Transactional
    public ProductCardResponse updateStatus(UUID userId, UUID productId, ProductStatus status) {
        Product product = verifyOwnership(userId, productId);
        product.setStatus(status);
        productRepository.save(product);
        return productService.getProductCard(productId);
    }

    @Transactional
    public void softDeleteProduct(UUID userId, UUID productId) {
        Product product = verifyOwnership(userId, productId);
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Transactional
    public ProductVariant addVariant(UUID userId, UUID productId, ProductVariantRequest req) {
        Product product = verifyOwnership(userId, productId);
        return addVariantInternal(product, req);
    }

    @Transactional
    public ProductVariant updateVariant(UUID userId, UUID productId, UUID variantId, ProductVariantRequest req) {
        verifyOwnership(userId, productId);
        ProductVariant v = variantRepository.findById(variantId).orElseThrow();
        if (!v.getProduct().getId().equals(productId)) throw new BadRequestException("Variant mismatch");
        if (req.getSize() != null) v.setSize(req.getSize());
        if (req.getColor() != null) v.setColor(req.getColor());
        if (req.getColorHex() != null) v.setColorHex(req.getColorHex());
        if (req.getSku() != null) v.setSku(req.getSku());
        v.setStockQuantity(req.getStockQuantity());
        return variantRepository.save(v);
    }

    @Transactional
    public ProductVariant updateStock(UUID userId, UUID productId, UUID variantId, int quantity) {
        verifyOwnership(userId, productId);
        ProductVariant v = variantRepository.findById(variantId).orElseThrow();
        v.setStockQuantity(quantity);
        ProductVariant saved = variantRepository.save(v);
        if (quantity > 0) {
            stockAlertService.notifyBackInStock(variantId);
        }
        return saved;
    }

    @Transactional
    public ProductImageResponse addImage(UUID userId, UUID productId, ProductImageRequest req) {
        Product product = verifyOwnership(userId, productId);
        int sort = req.getSortOrder() != null ? req.getSortOrder() : imageRepository.findByProductIdOrderBySortOrderAsc(productId).size();
        ProductImage img = addImageInternal(product, req, sort);
        return ProductImageResponse.builder()
                .id(img.getId())
                .imageUrl(img.getImageUrl())
                .thumbnailUrl(img.getThumbnailUrl())
                .altText(img.getAltText())
                .isPrimary(img.getIsPrimary())
                .build();
    }

    @Transactional
    public void removeImage(UUID userId, UUID productId, UUID imageId) {
        verifyOwnership(userId, productId);
        imageRepository.deleteById(imageId);
    }

    @Transactional
    public ProductVideo addVideo(UUID userId, UUID productId, String videoUrl) {
        Product product = verifyOwnership(userId, productId);
        return videoRepository.save(ProductVideo.builder().product(product).videoUrl(videoUrl).build());
    }

    // Admin helpers (no ownership check)
    @Transactional(readOnly = true)
    public PageResponse<ProductCardResponse> adminListProducts(int page, int size, ProductStatus status, UUID sellerId) {
        PageRequest pr = PageRequest.of(page, size);
        Page<Product> products;
        if (sellerId != null && status != null) {
            products = productRepository.findBySellerIdAndStatus(sellerId, status, pr);
        } else if (sellerId != null) {
            products = productRepository.findBySellerId(sellerId, pr);
        } else if (status != null) {
            products = productRepository.findByStatus(status, pr);
        } else {
            products = productRepository.findAll(pr);
        }
        var cards = products.getContent().stream().map(p -> productService.getProductCard(p.getId())).toList();
        return PageResponse.of(cards, products.getTotalElements(), products.getTotalPages(), products.getNumber(), products.getSize());
    }

    public ProductDetailResponse adminGetProduct(UUID productId) {
        return productService.getProductByIdForAdmin(productId);
    }

    public ProductCardResponse adminGetProductCard(UUID productId) {
        return productService.getProductCard(productId);
    }

    @Transactional
    public Product adminUpdateProduct(UUID productId, UpdateProductRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (req.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(req.getCategoryId()).orElseThrow());
        }
        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getBasePrice() != null) product.setBasePrice(req.getBasePrice());
        if (req.getMrp() != null) product.setMrp(req.getMrp());
        if (req.getDiscountPercent() != null) product.setDiscountPercent(req.getDiscountPercent());
        return productRepository.save(product);
    }

    @Transactional
    public ProductVariant adminUpdateStock(UUID productId, UUID variantId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        ProductVariant v = variantRepository.findById(variantId).orElseThrow();
        if (!v.getProduct().getId().equals(product.getId())) {
            throw new BadRequestException("Variant mismatch");
        }
        v.setStockQuantity(quantity);
        ProductVariant saved = variantRepository.save(v);
        if (quantity > 0) {
            stockAlertService.notifyBackInStock(variantId);
        }
        return saved;
    }

    @Transactional
    public Product adminSetFeatured(UUID productId, boolean featured) {
        Product p = productRepository.findById(productId).orElseThrow();
        p.setIsFeatured(featured);
        return productRepository.save(p);
    }

    @Transactional
    public Product adminSetStatus(UUID productId, ProductStatus status) {
        Product p = productRepository.findById(productId).orElseThrow();
        p.setStatus(status);
        return productRepository.save(p);
    }

    private Product verifyOwnership(UUID userId, UUID productId) {
        Seller seller = sellerRepository.findByUserId(userId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new BadRequestException("Not your product");
        }
        return product;
    }

    private ProductVariant addVariantInternal(Product product, ProductVariantRequest req) {
        return variantRepository.save(ProductVariant.builder()
                .product(product).size(req.getSize()).color(req.getColor()).colorHex(req.getColorHex())
                .stockQuantity(req.getStockQuantity()).sku(req.getSku()).isActive(true).build());
    }

    private ProductImage addImageInternal(Product product, ProductImageRequest req, int sort) {
        long existing = imageRepository.countByProductId(product.getId());
        boolean primary = Boolean.TRUE.equals(req.getIsPrimary()) || existing == 0;
        if (primary) {
            imageRepository.clearPrimaryForProduct(product.getId());
        }
        return imageRepository.save(ProductImage.builder()
                .product(product).imageUrl(req.getImageUrl()).altText(req.getAltText())
                .isPrimary(primary)
                .sortOrder(sort).build());
    }

    private String uniqueSlug(String name) {
        String base = name.toLowerCase(Locale.ENGLISH).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (base.isBlank()) base = "product";
        String slug = base;
        int n = 0;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + (++n);
        }
        return slug;
    }
}
