package com.harithafashion.controller;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.PageResponse;
import com.harithafashion.dto.response.ProductCardResponse;
import com.harithafashion.dto.response.ProductDetailResponse;
import com.harithafashion.dto.response.ProductImageResponse;
import com.harithafashion.dto.response.SellerOrderItemResponse;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.repository.OrderItemRepository;
import com.harithafashion.repository.SellerPayoutRepository;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final SellerProductService sellerProductService;
    private final OrderItemRepository orderItemRepository;
    private final SellerPayoutRepository payoutRepository;
    private final ReviewService reviewService;
    private final ProductQAService productQAService;
    private final BulkUploadService bulkUploadService;

    @PostMapping("/register")
    public ApiResponse<?> register(@AuthenticationPrincipal UserPrincipal p, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(sellerService.register(p.getId(), body));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(sellerService.dashboard(p.getId()));
    }

    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<PageResponse<ProductCardResponse>> myProducts(
            @AuthenticationPrincipal UserPrincipal p,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ProductStatus status) {
        return ApiResponse.ok(sellerProductService.listMyProducts(p.getId(), page, size, status));
    }

    @GetMapping("/products/{productId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductDetailResponse> getProduct(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID productId) {
        return ApiResponse.ok(sellerProductService.getMyProductDetail(p.getId(), productId));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductCardResponse> createProduct(@AuthenticationPrincipal UserPrincipal p,
                                                @Valid @RequestBody CreateProductRequest req) {
        return ApiResponse.ok(sellerProductService.createProduct(p.getId(), req));
    }

    @PostMapping(value = "/products/bulk-upload/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Map<String, Object>> bulkUploadExcel(@AuthenticationPrincipal UserPrincipal p,
                                                            @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(bulkUploadService.processExcel(file, p.getId()));
    }

    @PostMapping(value = "/products/bulk-upload/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Map<String, Object>> bulkUploadCsv(@AuthenticationPrincipal UserPrincipal p,
                                                          @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(bulkUploadService.processCsv(file, p.getId()));
    }

    @GetMapping("/products/bulk-upload/template")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<String> bulkUploadTemplate() {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header("Content-Disposition", "attachment; filename=\"product-upload-template.csv\"")
                .body(bulkUploadService.generateTemplate());
    }

    @PutMapping("/products/{productId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductCardResponse> updateProduct(@AuthenticationPrincipal UserPrincipal p,
                                                @PathVariable UUID productId,
                                                @RequestBody UpdateProductRequest req) {
        return ApiResponse.ok(sellerProductService.updateProduct(p.getId(), productId, req));
    }

    @PatchMapping("/products/{productId}/status")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductCardResponse> updateStatus(@AuthenticationPrincipal UserPrincipal p,
                                             @PathVariable UUID productId,
                                             @RequestBody Map<String, String> body) {
        return ApiResponse.ok(sellerProductService.updateStatus(p.getId(), productId,
                ProductStatus.valueOf(body.get("status"))));
    }

    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Void> deleteProduct(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID productId) {
        sellerProductService.softDeleteProduct(p.getId(), productId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/products/{productId}/variants")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductVariant> addVariant(@AuthenticationPrincipal UserPrincipal p,
                                                  @PathVariable UUID productId,
                                                  @Valid @RequestBody ProductVariantRequest req) {
        return ApiResponse.ok(sellerProductService.addVariant(p.getId(), productId, req));
    }

    @PutMapping("/products/{productId}/variants/{variantId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductVariant> updateVariant(@AuthenticationPrincipal UserPrincipal p,
                                                     @PathVariable UUID productId,
                                                     @PathVariable UUID variantId,
                                                     @Valid @RequestBody ProductVariantRequest req) {
        return ApiResponse.ok(sellerProductService.updateVariant(p.getId(), productId, variantId, req));
    }

    @PatchMapping("/products/{productId}/variants/{variantId}/stock")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductVariant> updateStock(@AuthenticationPrincipal UserPrincipal p,
                                                   @PathVariable UUID productId,
                                                   @PathVariable UUID variantId,
                                                   @RequestBody Map<String, Integer> body) {
        return ApiResponse.ok(sellerProductService.updateStock(p.getId(), productId, variantId, body.get("quantity")));
    }

    @PostMapping("/products/{productId}/images")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductImageResponse> addImage(@AuthenticationPrincipal UserPrincipal p,
                                              @PathVariable UUID productId,
                                              @Valid @RequestBody ProductImageRequest req) {
        return ApiResponse.ok(sellerProductService.addImage(p.getId(), productId, req));
    }

    @DeleteMapping("/products/{productId}/images/{imageId}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Void> removeImage(@AuthenticationPrincipal UserPrincipal p,
                                         @PathVariable UUID productId,
                                         @PathVariable UUID imageId) {
        sellerProductService.removeImage(p.getId(), productId, imageId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/products/{productId}/videos")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<ProductVideo> addVideo(@AuthenticationPrincipal UserPrincipal p,
                                              @PathVariable UUID productId,
                                              @RequestBody Map<String, String> body) {
        return ApiResponse.ok(sellerProductService.addVideo(p.getId(), productId, body.get("videoUrl")));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<PageResponse<SellerOrderItemResponse>> orders(@AuthenticationPrincipal UserPrincipal p,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(sellerService.listOrders(p.getId(), page, size));
    }

    @GetMapping("/payouts")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<?> payouts(@AuthenticationPrincipal UserPrincipal p,
                                  @RequestParam(defaultValue = "0") int page) {
        Seller seller = sellerService.getByUserId(p.getId());
        return ApiResponse.ok(PageResponse.from(
                payoutRepository.findBySellerId(seller.getId(), PageRequest.of(page, 20))));
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<?> reviews(@AuthenticationPrincipal UserPrincipal p,
                                  @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(reviewService.listForSeller(p.getId(), page, 20)));
    }

    @GetMapping("/questions")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<?> questions(@AuthenticationPrincipal UserPrincipal p,
                                    @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(productQAService.listForSeller(p.getId(), page, 20)));
    }

    @PostMapping("/reviews/{reviewId}/reply")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Review> replyReview(@AuthenticationPrincipal UserPrincipal p,
                                           @PathVariable UUID reviewId,
                                           @RequestBody Map<String, String> body) {
        return ApiResponse.ok(reviewService.sellerReply(reviewId, p.getId(), body.get("reply")));
    }

    @PostMapping("/questions/{questionId}/answers")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<?> answerQuestion(@AuthenticationPrincipal UserPrincipal p,
                                         @PathVariable UUID questionId,
                                         @RequestBody Map<String, String> body) {
        return ApiResponse.ok(productQAService.answerQuestion(questionId, p.getId(), body.get("answer"), true));
    }
}
