package com.harithafashion.controller;

import com.harithafashion.dto.request.BannerRequest;
import com.harithafashion.dto.request.CouponRequest;
import com.harithafashion.dto.request.CreateProductRequest;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.PageResponse;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.entity.enums.SellerStatus;
import com.harithafashion.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final SellerPayoutService payoutService;
    private final ReturnService returnService;
    private final SellerProductService sellerProductService;
    private final BannerService bannerService;
    private final CouponService couponService;
    private final ReportService reportService;
    private final ReviewService reviewService;
    private final ProductQAService productQAService;
    private final SupportService supportService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    @GetMapping("/orders")
    public ApiResponse<PageResponse<Order>> orders(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(PageResponse.from(adminService.listOrders(page, size)));
    }

    @GetMapping("/users")
    public ApiResponse<?> users(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(adminService.listUsers(page, 20)));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<User> user(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}/block")
    public ApiResponse<?> block(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.blockUser(id));
    }

    @PutMapping("/users/{id}/unblock")
    public ApiResponse<?> unblock(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.unblockUser(id));
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<User> role(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(adminService.updateRole(id, body.get("role")));
    }

    @GetMapping("/sellers")
    public ApiResponse<?> sellers(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(required = false) SellerStatus status) {
        return ApiResponse.ok(PageResponse.from(adminService.listSellers(page, 20, status)));
    }

    @PutMapping("/sellers/{id}/approve")
    public ApiResponse<?> approveSeller(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.approveSeller(id));
    }

    @PutMapping("/sellers/{id}/reject")
    public ApiResponse<?> rejectSeller(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.rejectSeller(id));
    }

    @PutMapping("/sellers/{id}/suspend")
    public ApiResponse<?> suspendSeller(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.suspendSeller(id));
    }

    @GetMapping("/products")
    public ApiResponse<?> products(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(required = false) ProductStatus status,
                                   @RequestParam(required = false) UUID sellerId) {
        return ApiResponse.ok(PageResponse.from(sellerProductService.adminListProducts(page, 20, status, sellerId)));
    }

    @PostMapping("/products")
    public ApiResponse<Product> createProduct(@RequestBody CreateProductRequest req) {
        throw new com.harithafashion.exception.BadRequestException("Use seller account to create products");
    }

    @PatchMapping("/products/{id}/featured")
    public ApiResponse<Product> featured(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ApiResponse.ok(sellerProductService.adminSetFeatured(id, Boolean.TRUE.equals(body.get("featured"))));
    }

    @PatchMapping("/products/{id}/status")
    public ApiResponse<Product> productStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(sellerProductService.adminSetStatus(id, ProductStatus.valueOf(body.get("status"))));
    }

    @GetMapping("/banners")
    public ApiResponse<?> banners() {
        return ApiResponse.ok(bannerService.listAll());
    }

    @PostMapping("/banners")
    public ApiResponse<Banner> createBanner(@RequestBody BannerRequest req) {
        return ApiResponse.ok(bannerService.create(req));
    }

    @PutMapping("/banners/{id}")
    public ApiResponse<Banner> updateBanner(@PathVariable UUID id, @RequestBody BannerRequest req) {
        return ApiResponse.ok(bannerService.update(id, req));
    }

    @DeleteMapping("/banners/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable UUID id) {
        bannerService.delete(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/coupons")
    public ApiResponse<?> coupons(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(couponService.listCoupons(page, 20)));
    }

    @PostMapping("/coupons")
    public ApiResponse<Coupon> createCoupon(@RequestBody CouponRequest req) {
        return ApiResponse.ok(couponService.createCoupon(req));
    }

    @PutMapping("/coupons/{id}")
    public ApiResponse<Coupon> updateCoupon(@PathVariable UUID id, @RequestBody CouponRequest req) {
        return ApiResponse.ok(couponService.updateCoupon(id, req));
    }

    @DeleteMapping("/coupons/{id}")
    public ApiResponse<Void> deactivateCoupon(@PathVariable UUID id) {
        couponService.deactivateCoupon(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/reports/sales")
    public ApiResponse<Map<String, Object>> salesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(reportService.salesReport(from, to));
    }

    @GetMapping("/reports/abandoned-carts")
    public ApiResponse<Map<String, Object>> abandonedCarts() {
        return ApiResponse.ok(reportService.abandonedCartReport());
    }

    @GetMapping("/reports/returns")
    public ApiResponse<Map<String, Object>> returnsReport() {
        return ApiResponse.ok(reportService.returnsReport());
    }

    @GetMapping("/reports/coupons")
    public ApiResponse<Map<String, Object>> couponReport() {
        return ApiResponse.ok(reportService.couponReport());
    }

    @GetMapping("/reports/sellers")
    public ApiResponse<Map<String, Object>> sellerReport() {
        return ApiResponse.ok(reportService.sellerReport());
    }

    @GetMapping("/reports/products/top")
    public ApiResponse<Map<String, Object>> topProducts() {
        return ApiResponse.ok(reportService.topProductsReport());
    }

    @PutMapping("/reviews/{id}/approve")
    public ApiResponse<Review> approveReview(@PathVariable UUID id) {
        return ApiResponse.ok(reviewService.approveReview(id));
    }

    @PutMapping("/questions/{id}/approve")
    public ApiResponse<Void> approveQuestion(@PathVariable UUID id) {
        productQAService.approveQuestion(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/support/tickets")
    public ApiResponse<?> supportTickets(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(supportService.getAllTickets(page, 20));
    }

    @PutMapping("/support/tickets/{id}/status")
    public ApiResponse<?> updateTicketStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(supportService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/users/{id}/impersonate")
    public ApiResponse<Map<String, String>> impersonate(@PathVariable UUID id) {
        return ApiResponse.ok(adminService.impersonateUser(id));
    }

    @GetMapping("/fraud/queue")
    public ApiResponse<?> fraudQueue(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(adminService.fraudFlaggedUsers(page, 20));
    }

    @DeleteMapping("/fraud/queue/{userId}")
    public ApiResponse<Void> clearFraudFlag(@PathVariable UUID userId) {
        adminService.clearFraudFlag(userId);
        return ApiResponse.ok(null);
    }

    @PutMapping("/orders/{id}/deliver")
    public ApiResponse<Void> markDelivered(@PathVariable UUID id) {
        adminService.markOrderDelivered(id);
        return ApiResponse.ok(null);
    }

    @PutMapping("/orders/{id}/ship")
    public ApiResponse<Void> shipOrder(@PathVariable UUID id) {
        adminService.shipOrder(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/returns")
    public ApiResponse<?> returns(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(required = false) String status) {
        return ApiResponse.ok(PageResponse.from(adminService.listReturns(page, 20, status)));
    }

    @GetMapping("/reviews/pending")
    public ApiResponse<?> pendingReviews(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(reviewService.listPending(page, 20)));
    }

    @GetMapping("/questions/pending")
    public ApiResponse<?> pendingQuestions(@RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(PageResponse.from(productQAService.listPending(page, 20)));
    }

    @PostMapping("/payouts/process")
    public ApiResponse<Void> payouts() {
        payoutService.processMonthlyPayouts();
        return ApiResponse.ok(null);
    }

    @PutMapping("/returns/{id}/process")
    public ApiResponse<?> processReturn(@PathVariable UUID id) {
        return ApiResponse.ok(returnService.processReturn(id));
    }
}
