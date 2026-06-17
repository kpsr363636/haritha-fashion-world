package com.harithafashion.controller;

import com.harithafashion.dto.request.*;
import com.harithafashion.dto.response.*;
import com.harithafashion.entity.Order;
import com.harithafashion.entity.Shipment;
import com.harithafashion.repository.ShipmentRepository;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;
    private final ReturnService returnService;
    private final ShipmentService shipmentService;
    private final ShipmentRepository shipmentRepository;

    @PostMapping
    public ApiResponse<PlaceOrderResponse> placeOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PlaceOrderRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponse.ok(orderService.placeOrder(principal.getId(), request, httpRequest.getRemoteAddr()));
    }

    @GetMapping
    public ApiResponse<PageResponse<Order>> listOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var p = orderService.getUserOrders(principal.getId(), page, size);
        return ApiResponse.ok(PageResponse.from(p));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDetailResponse> getOrder(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(orderService.getOrderDetail(id, principal.getId()));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> invoice(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        Order order = orderService.getOrderWithItems(id, principal.getId());
        byte[] pdf = invoiceService.generateInvoicePdf(order);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + order.getOrderNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF).body(pdf);
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Order> cancel(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(orderService.cancelOrder(id, principal.getId()));
    }

    @PostMapping("/{id}/items/{itemId}/return")
    public ApiResponse<?> initiateReturn(
            @PathVariable UUID id, @PathVariable UUID itemId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ReturnRequestDto dto) {
        return ApiResponse.ok(returnService.initiateReturn(itemId, principal.getId(), dto));
    }

    @PostMapping("/{id}/cod-verify")
    public ApiResponse<Void> verifyCod(@PathVariable UUID id, @RequestBody Map<String, String> body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        orderService.verifyCodOtp(id, principal.getId(), body.get("otp"));
        return ApiResponse.ok(null, "COD verified");
    }

    @GetMapping("/{id}/tracking")
    public ApiResponse<List<Map<String, Object>>> tracking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Verify ownership
        orderService.getOrderDetail(id, principal.getId());
        List<Shipment> shipments = shipmentRepository.findByOrderId(id);
        List<Map<String, Object>> result = shipments.stream().map(s -> {
            Map<String, Object> tracking = shipmentService.trackShipment(s.getAwbNumber());
            java.util.Map<String, Object> info = new java.util.LinkedHashMap<>();
            info.put("awb", s.getAwbNumber());
            info.put("courier", s.getCourierName());
            info.put("status", s.getStatus());
            info.put("trackingUrl", s.getTrackingUrl());
            info.put("estimatedDelivery", s.getEstimatedDelivery());
            info.put("shippedAt", s.getShippedAt());
            info.put("deliveredAt", s.getDeliveredAt());
            info.put("liveTracking", tracking);
            return info;
        }).toList();
        return ApiResponse.ok(result);
    }
}
