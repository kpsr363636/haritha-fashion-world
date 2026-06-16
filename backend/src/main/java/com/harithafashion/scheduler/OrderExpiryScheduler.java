package com.harithafashion.scheduler;

import com.harithafashion.repository.OrderRepository;
import com.harithafashion.entity.enums.OrderStatus;
import com.harithafashion.entity.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpiryScheduler {

    private final OrderRepository orderRepository;

    @Value("${scheduler.order-expiry.enabled:true}")
    private boolean enabled;

    @Scheduled(fixedDelay = 900_000)
    @Transactional
    public void expireUnpaidOrders() {
        if (!enabled) return;
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        orderRepository.findByPaymentStatusOrderByPlacedAtDesc(PaymentStatus.PENDING,
                org.springframework.data.domain.PageRequest.of(0, 100)).forEach(order -> {
            if (order.getPlacedAt() != null && order.getPlacedAt().isBefore(cutoff)
                    && !Boolean.TRUE.equals(order.getIsCod())) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                log.info("Expired unpaid order {}", order.getOrderNumber());
            }
        });
    }
}
