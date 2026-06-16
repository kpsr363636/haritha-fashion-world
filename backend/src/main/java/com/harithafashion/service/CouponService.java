package com.harithafashion.service;

import com.harithafashion.dto.request.CouponRequest;
import com.harithafashion.entity.Coupon;
import com.harithafashion.entity.CouponUsage;
import com.harithafashion.entity.Order;
import com.harithafashion.entity.User;
import com.harithafashion.entity.enums.CouponType;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.CouponRepository;
import com.harithafashion.repository.CouponUsageRepository;
import com.harithafashion.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final OrderRepository orderRepository;

    public BigDecimal applyCoupon(String code, UUID userId, BigDecimal orderAmount, UUID categoryId) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon"));
        validateCoupon(coupon, userId, orderAmount, categoryId);
        return calculateDiscount(coupon, orderAmount);
    }

    @Transactional
    public void recordUsage(Coupon coupon, User user, UUID orderId, BigDecimal discount) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        Order order = orderId != null ? orderRepository.findById(orderId).orElse(null) : null;
        couponUsageRepository.save(CouponUsage.builder()
                .coupon(coupon).user(user).order(order).discountGiven(discount).build());
    }

    @Transactional
    public void recordUsageForOrder(String code, User user, Order order, BigDecimal discount) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code).orElseThrow();
        recordUsage(coupon, user, order.getId(), discount);
    }

    private void validateCoupon(Coupon coupon, UUID userId, BigDecimal orderAmount, UUID categoryId) {
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new BadRequestException("Coupon not yet valid");
        }
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            throw new BadRequestException("Coupon expired");
        }
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount not met");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        long userUsage = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
        if (userUsage >= coupon.getPerUserLimit()) {
            throw new BadRequestException("Coupon already used");
        }
        if (Boolean.TRUE.equals(coupon.getIsFirstOrderOnly()) && orderRepository.countByUserId(userId) > 0) {
            throw new BadRequestException("First order only coupon");
        }
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null) {
                discount = discount.min(coupon.getMaxDiscountAmount());
            }
        } else if (coupon.getType() == CouponType.FLAT) {
            discount = coupon.getDiscountValue();
        } else {
            discount = BigDecimal.ZERO;
        }
        return discount.min(orderAmount);
    }

    public Page<Coupon> listCoupons(int page, int size) {
        return couponRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public Coupon createCoupon(CouponRequest req) {
        if (couponRepository.existsByCode(req.getCode())) {
            throw new BadRequestException("Coupon code exists");
        }
        return couponRepository.save(Coupon.builder()
                .code(req.getCode()).description(req.getDescription())
                .type(CouponType.valueOf(req.getType()))
                .discountValue(req.getDiscountValue())
                .minOrderAmount(req.getMinOrderAmount() != null ? req.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(req.getMaxDiscountAmount())
                .usageLimit(req.getUsageLimit())
                .perUserLimit(req.getPerUserLimit() != null ? req.getPerUserLimit() : 1)
                .isFirstOrderOnly(Boolean.TRUE.equals(req.getIsFirstOrderOnly()))
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .validFrom(req.getValidFrom()).validUntil(req.getValidUntil()).build());
    }

    @Transactional
    public Coupon updateCoupon(UUID id, CouponRequest req) {
        Coupon c = couponRepository.findById(id).orElseThrow();
        if (req.getDescription() != null) c.setDescription(req.getDescription());
        if (req.getDiscountValue() != null) c.setDiscountValue(req.getDiscountValue());
        if (req.getMinOrderAmount() != null) c.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getMaxDiscountAmount() != null) c.setMaxDiscountAmount(req.getMaxDiscountAmount());
        if (req.getUsageLimit() != null) c.setUsageLimit(req.getUsageLimit());
        if (req.getPerUserLimit() != null) c.setPerUserLimit(req.getPerUserLimit());
        if (req.getIsFirstOrderOnly() != null) c.setIsFirstOrderOnly(req.getIsFirstOrderOnly());
        if (req.getIsActive() != null) c.setIsActive(req.getIsActive());
        if (req.getValidFrom() != null) c.setValidFrom(req.getValidFrom());
        if (req.getValidUntil() != null) c.setValidUntil(req.getValidUntil());
        return couponRepository.save(c);
    }

    @Transactional
    public void deactivateCoupon(UUID id) {
        Coupon c = couponRepository.findById(id).orElseThrow();
        c.setIsActive(false);
        couponRepository.save(c);
    }
}
