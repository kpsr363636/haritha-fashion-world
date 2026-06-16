package com.harithafashion.service;

import com.harithafashion.dto.request.AddToCartRequest;
import com.harithafashion.dto.response.CartItemResponse;
import com.harithafashion.dto.response.CartResponse;
import com.harithafashion.entity.*;
import com.harithafashion.exception.OutOfStockException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.harithafashion.util.GstCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("499");
    private static final BigDecimal DELIVERY_CHARGE = new BigDecimal("49");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final StockReservationService stockReservationService;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addToCart(UUID userId, AddToCartRequest req) {
        ProductVariant variant = variantRepository.findById(req.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        int available = variant.getStockQuantity() - variant.getReservedQuantity();
        if (available < req.getQuantity()) {
            throw new OutOfStockException("Insufficient stock");
        }
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return cartRepository.save(Cart.builder().user(user).build());
                });
        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), req.getVariantId())
                .orElse(null);
        if (item != null) {
            item.setQuantity(item.getQuantity() + req.getQuantity());
        } else {
            Product product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(req.getQuantity())
                    .build();
            cart.getItems().add(item);
        }
        cartItemRepository.save(item);
        stockReservationService.reserve(variant.getId(), userId, req.getQuantity());
        return getCartWithDetails(userId);
    }

    @Transactional(readOnly = true)
    public CartResponse getCartWithDetails(UUID userId) {
        Cart cart = cartRepository.findByUserIdWithDetails(userId)
                .orElse(null);
        if (cart == null) {
            return CartResponse.builder()
                    .items(new ArrayList<>())
                    .subtotal(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .gstAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .deliveryCharge(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .freeDelivery(false)
                    .build();
        }
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstTotal = BigDecimal.ZERO;

        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();
            ProductVariant variant = ci.getVariant();
            BigDecimal unitPrice = calcFinalPrice(p);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            String categorySlug = p.getCategory() != null ? p.getCategory().getSlug() : "";
            BigDecimal gstRate = GstCalculator.getGstRate(categorySlug, unitPrice);
            BigDecimal gst = GstCalculator.extractGst(lineTotal, gstRate);
            gstTotal = gstTotal.add(gst);
            subtotal = subtotal.add(lineTotal);
            String image = imageRepository.findByProductIdAndIsPrimaryTrue(p.getId())
                    .map(ProductImage::getImageUrl).orElse(null);
            String variantInfo = buildVariantInfo(variant);
            items.add(CartItemResponse.builder()
                    .id(ci.getId())
                    .productId(p.getId())
                    .variantId(variant.getId())
                    .productName(p.getName())
                    .productImage(image)
                    .variantInfo(variantInfo)
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .priceChanged(false)
                    .build());
        }

        boolean freeDelivery = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0;
        BigDecimal delivery = freeDelivery ? BigDecimal.ZERO : (items.isEmpty() ? BigDecimal.ZERO : DELIVERY_CHARGE);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .gstAmount(gstTotal.setScale(2, RoundingMode.HALF_UP))
                .deliveryCharge(delivery)
                .total(subtotal.add(delivery).setScale(2, RoundingMode.HALF_UP))
                .freeDelivery(freeDelivery)
                .build();
    }

    @Transactional
    public CartResponse updateCartItem(UUID userId, UUID cartItemId, int quantity) {
        if (quantity <= 0) {
            return removeFromCart(userId, cartItemId);
        }
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Cart item not found");
        }
        int delta = quantity - item.getQuantity();
        if (delta > 0) {
            int available = item.getVariant().getStockQuantity() - item.getVariant().getReservedQuantity();
            if (available < delta) throw new OutOfStockException("Insufficient stock");
            stockReservationService.reserve(item.getVariant().getId(), userId, delta);
        } else if (delta < 0) {
            stockReservationService.release(item.getVariant().getId(), userId, -delta);
        }
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return getCartWithDetails(userId);
    }

    @Transactional
    public CartResponse removeFromCart(UUID userId, UUID cartItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        stockReservationService.release(item.getVariant().getId(), userId, item.getQuantity());
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return getCartWithDetails(userId);
    }

    @Transactional
    public CartResponse clearCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        for (CartItem item : new ArrayList<>(cart.getItems())) {
            stockReservationService.release(item.getVariant().getId(), userId, item.getQuantity());
            cartItemRepository.delete(item);
        }
        cart.getItems().clear();
        cartRepository.save(cart);
        return getCartWithDetails(userId);
    }

    private BigDecimal calcFinalPrice(Product p) {
        if (p.getDiscountPercent() == null || p.getDiscountPercent().compareTo(BigDecimal.ZERO) == 0) {
            return p.getBasePrice();
        }
        return p.getBasePrice().multiply(BigDecimal.ONE.subtract(
                p.getDiscountPercent().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String buildVariantInfo(ProductVariant v) {
        StringBuilder sb = new StringBuilder();
        if (v.getSize() != null) sb.append(v.getSize());
        if (v.getColor() != null) {
            if (!sb.isEmpty()) sb.append(" / ");
            sb.append(v.getColor());
        }
        return sb.toString();
    }
}
