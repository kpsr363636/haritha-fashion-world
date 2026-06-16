package com.harithafashion.service;

import com.harithafashion.dto.request.PlaceOrderRequest;
import com.harithafashion.dto.response.*;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import com.harithafashion.util.OrderIdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;
    private final StockReservationService stockReservationService;
    private final OrderIdGenerator orderIdGenerator;
    private final EmailService emailService;
    private final SmsService smsService;
    private final WhatsAppService whatsAppService;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final FraudDetectionService fraudDetectionService;
    private final CouponService couponService;
    private final GiftCardService giftCardService;
    private final LoyaltyService loyaltyService;
    private final RefundService refundService;
    private final PaymentService paymentService;
    private final ShipmentService shipmentService;
    private final ShipmentRepository shipmentRepository;
    private final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, AddressRepository addressRepository,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        CartService cartService, StockReservationService stockReservationService,
                        OrderIdGenerator orderIdGenerator, EmailService emailService, SmsService smsService,
                        WhatsAppService whatsAppService, SellerRepository sellerRepository,
                        ProductRepository productRepository, ProductVariantRepository variantRepository,
                        FraudDetectionService fraudDetectionService, CouponService couponService,
                        GiftCardService giftCardService, LoyaltyService loyaltyService,
                        RefundService refundService, @Lazy PaymentService paymentService,
                        ShipmentService shipmentService, ShipmentRepository shipmentRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartService = cartService;
        this.stockReservationService = stockReservationService;
        this.orderIdGenerator = orderIdGenerator;
        this.emailService = emailService;
        this.smsService = smsService;
        this.whatsAppService = whatsAppService;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.couponService = couponService;
        this.giftCardService = giftCardService;
        this.loyaltyService = loyaltyService;
        this.refundService = refundService;
        this.paymentService = paymentService;
        this.shipmentService = shipmentService;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public PlaceOrderResponse placeOrder(UUID userId, PlaceOrderRequest req, String ipAddress) {
        CartResponse cart = cartService.getCartWithDetails(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        User user = userRepository.findById(userId).orElseThrow();
        fraudDetectionService.checkOrder(user, req, cart.getTotal(), ipAddress);

        Address address = addressRepository.findByIdAndUserId(req.getAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        BigDecimal discount = BigDecimal.ZERO;
        if (req.getCouponCode() != null) {
            discount = couponService.applyCoupon(req.getCouponCode(), userId, cart.getSubtotal(), null);
        }
        BigDecimal giftDiscount = BigDecimal.ZERO;
        if (req.getGiftCardCode() != null) {
            giftDiscount = giftCardService.calculateDiscount(req.getGiftCardCode(), cart.getTotal().subtract(discount));
        }
        int loyaltyDiscount = 0;
        if (req.getLoyaltyPointsToUse() != null && req.getLoyaltyPointsToUse() > 0) {
            loyaltyDiscount = loyaltyService.pointsToDiscount(Math.min(req.getLoyaltyPointsToUse(), user.getLoyaltyPoints()));
            user.setLoyaltyPoints(user.getLoyaltyPoints() - req.getLoyaltyPointsToUse());
        }
        BigDecimal total = cart.getTotal().subtract(discount).subtract(giftDiscount)
                .subtract(new BigDecimal(loyaltyDiscount)).max(BigDecimal.ZERO);

        Map<String, Object> addressSnapshot = new HashMap<>();
        addressSnapshot.put("fullName", address.getFullName());
        addressSnapshot.put("mobile", address.getMobile());
        addressSnapshot.put("addressLine", address.getAddressLine());
        addressSnapshot.put("city", address.getCity());
        addressSnapshot.put("state", address.getState());
        addressSnapshot.put("pincode", address.getPincode());

        boolean isCod = "COD".equalsIgnoreCase(req.getPaymentMethod());
        String codOtp = isCod ? String.format("%06d", random.nextInt(1_000_000)) : null;

        Order order = Order.builder()
                .orderNumber(orderIdGenerator.generate())
                .user(user).address(address).addressSnapshot(addressSnapshot)
                .status(OrderStatus.PLACED).subtotal(cart.getSubtotal())
                .discountAmount(discount).gstAmount(cart.getGstAmount())
                .deliveryCharge(cart.getDeliveryCharge()).totalAmount(total)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING).isCod(isCod).codOtp(codOtp)
                .couponCode(req.getCouponCode()).giftCardCode(req.getGiftCardCode())
                .giftCardDiscount(giftDiscount).loyaltyPointsUsed(req.getLoyaltyPointsToUse())
                .loyaltyPointsEarned(total.divide(new BigDecimal("10"), 0, RoundingMode.DOWN).intValue())
                .build();
        order = orderRepository.save(order);

        if (req.getCouponCode() != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            couponService.recordUsageForOrder(req.getCouponCode(), user, order, discount);
        }
        if (req.getGiftCardCode() != null && giftDiscount.compareTo(BigDecimal.ZERO) > 0) {
            giftCardService.apply(req.getGiftCardCode(), order.getId(), giftDiscount);
        }

        for (var item : cart.getItems()) {
            stockReservationService.confirmSale(item.getVariantId(), item.getQuantity());
            Product product = productRepository.findByIdWithSeller(item.getProductId()).orElseThrow();
            ProductVariant variant = variantRepository.findById(item.getVariantId()).orElse(null);
            Seller seller = product.getSeller();
            BigDecimal sellerAmount = item.getLineTotal().multiply(new BigDecimal("0.90"));
            orderItemRepository.save(OrderItem.builder()
                    .order(order).product(product).variant(variant).seller(seller)
                    .productName(item.getProductName()).productImage(item.getProductImage())
                    .variantInfo(item.getVariantInfo()).quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice()).totalPrice(item.getLineTotal())
                    .sellerAmount(sellerAmount).commissionAmount(item.getLineTotal().subtract(sellerAmount))
                    .returnWindowUntil(LocalDate.now().plusDays(product.getReturnWindowDays())).build());
            if (seller != null) {
                seller.setPendingPayout(seller.getPendingPayout().add(sellerAmount));
                sellerRepository.save(seller);
            }
        }

        user.setLoyaltyPoints(user.getLoyaltyPoints() + order.getLoyaltyPointsEarned());
        userRepository.save(user);
        loyaltyService.awardForOrder(order);
        clearCart(userId);

        emailService.sendOrderConfirmedEmail(user.getEmail(), user.getName(), order.getOrderNumber(), total.toString());
        whatsAppService.sendOrderConfirmation(user.getMobile(), order.getOrderNumber(), total.toString(), "3-5 days");
        if (isCod && codOtp != null) smsService.sendCodOtp(user.getMobile(), codOtp);

        PlaceOrderResponse.PlaceOrderResponseBuilder resp = PlaceOrderResponse.builder()
                .orderId(order.getId()).orderNumber(order.getOrderNumber())
                .totalAmount(total).paymentMethod(req.getPaymentMethod())
                .requiresPayment(!isCod)
                .requiresCodVerification(isCod);
        if (!isCod) {
            Map<String, Object> pay = paymentService.createRazorpayOrder(order.getId());
            resp.razorpayOrderId((String) pay.get("razorpayOrderId"));
            resp.razorpayKeyId((String) pay.get("keyId"));
        }
        return resp.build();
    }

    public Page<Order> getUserOrders(UUID userId, int page, int size) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        return toDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderWithItems(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        order.setItems(orderItemRepository.findByOrderId(id));
        return order;
    }

    public Order getOrder(UUID id, UUID userId) {
        return getOrderWithItems(id, userId);
    }

    private OrderDetailResponse toDetailResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        ShipmentSummaryResponse shipment = shipmentRepository.findByOrderId(order.getId()).stream()
                .findFirst()
                .map(s -> ShipmentSummaryResponse.builder()
                        .trackingNumber(s.getAwbNumber())
                        .awbNumber(s.getAwbNumber())
                        .courierName(s.getCourierName())
                        .trackingUrl(s.getTrackingUrl())
                        .status(s.getStatus())
                        .build())
                .orElse(null);
        Map<String, Object> snap = order.getAddressSnapshot();
        String addressDisplay = null;
        if (snap != null) {
            addressDisplay = String.format("%s, %s, %s %s",
                    snap.getOrDefault("fullName", ""),
                    snap.getOrDefault("addressLine", ""),
                    snap.getOrDefault("city", ""),
                    snap.getOrDefault("pincode", ""));
        }
        boolean requiresCod = Boolean.TRUE.equals(order.getIsCod())
                && !Boolean.TRUE.equals(order.getCodOtpVerified());
        return OrderDetailResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .isCod(order.getIsCod())
                .codOtpVerified(order.getCodOtpVerified())
                .requiresCodVerification(requiresCod)
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .gstAmount(order.getGstAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .totalAmount(order.getTotalAmount())
                .addressSnapshot(snap)
                .addressDisplay(addressDisplay)
                .placedAt(order.getPlacedAt())
                .items(items.stream().map(this::toItemDetail).collect(Collectors.toList()))
                .shipment(shipment)
                .build();
    }

    private OrderItemDetailResponse toItemDetail(OrderItem item) {
        return OrderItemDetailResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .variantInfo(item.getVariantInfo())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getTotalPrice())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
                .build();
    }

    @Transactional
    public Order cancelOrder(UUID id, UUID userId) {
        Order order = getOrderWithItems(id, userId);
        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderItemRepository.findByOrderId(id).forEach(item -> {
            if (item.getVariant() != null) {
                ProductVariant v = variantRepository.findByIdForUpdate(item.getVariant().getId()).orElseThrow();
                v.setStockQuantity(v.getStockQuantity() + item.getQuantity());
                variantRepository.save(v);
            }
            if (item.getSeller() != null) {
                Seller s = item.getSeller();
                s.setPendingPayout(s.getPendingPayout().subtract(item.getSellerAmount()).max(BigDecimal.ZERO));
                sellerRepository.save(s);
            }
        });
        refundService.processRefund(id, null, order.getTotalAmount(), "Order cancelled");
        loyaltyService.deductForOrderCancel(order);
        return orderRepository.save(order);
    }

    @Transactional
    public void verifyCodOtp(UUID orderId, UUID userId, String otp) {
        Order order = getOrderWithItems(orderId, userId);
        if (!Boolean.TRUE.equals(order.getIsCod())) throw new BadRequestException("Not a COD order");
        if (!order.getCodOtp().equals(otp)) throw new BadRequestException("Invalid OTP");
        order.setCodOtpVerified(true);
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);
        shipmentService.markDelivered(orderId);
    }

    private void clearCart(UUID userId) {
        cartRepository.findByUserIdWithDetails(userId).ifPresent(cart -> {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }
}
