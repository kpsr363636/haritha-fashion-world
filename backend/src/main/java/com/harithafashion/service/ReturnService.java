package com.harithafashion.service;

import com.harithafashion.dto.request.ReturnRequestDto;
import com.harithafashion.entity.*;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShipmentService shipmentService;
    private final RefundService refundService;
    private final EmailService emailService;

    @Transactional
    public ReturnRequest initiateReturn(UUID orderItemId, UUID userId, ReturnRequestDto dto) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));
        if (!item.getOrder().getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        if (item.getOrder().getStatus() != OrderStatus.DELIVERED && item.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Item must be delivered to return");
        }
        if (item.getReturnWindowUntil() != null && item.getReturnWindowUntil().isBefore(LocalDate.now())) {
            throw new BadRequestException("Return window expired");
        }
        Product product = item.getProduct();
        if (product != null && Boolean.FALSE.equals(product.getIsReturnable())) {
            throw new BadRequestException("Product is not returnable");
        }
        User user = userRepository.findById(userId).orElseThrow();
        ReturnRequest req = ReturnRequest.builder()
                .order(item.getOrder()).orderItem(item).user(user)
                .returnType(dto.getReturnType()).reason(dto.getReason())
                .description(dto.getDescription()).images(dto.getImages())
                .exchangeSize(dto.getExchangeSize()).exchangeColor(dto.getExchangeColor())
                .pickupDate(dto.getPickupDate()).status("REQUESTED").build();
        shipmentService.scheduleReversePickup(req);
        returnRequestRepository.save(req);
        item.setStatus(OrderStatus.RETURN_REQUESTED);
        orderItemRepository.save(item);
        emailService.sendReturnInitiatedEmail(user.getEmail(), user.getName(), item.getOrder().getOrderNumber());
        return req;
    }

    @Transactional
    public ReturnRequest processReturn(UUID returnRequestId) {
        ReturnRequest req = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
        req.setStatus("RECEIVED");
        returnRequestRepository.save(req);
        OrderItem item = req.getOrderItem();
        Refund refund = refundService.processRefund(req.getOrder().getId(), item.getId(),
                item.getTotalPrice(), req.getReason());
        req.setRefund(refund);
        req.setStatus("REFUNDED");
        returnRequestRepository.save(req);
        User user = req.getUser();
        if (user.getEmail() != null) {
            emailService.sendReturnRefundedEmail(user.getEmail(), user.getName(), item.getTotalPrice().toString());
        }
        return req;
    }
}
