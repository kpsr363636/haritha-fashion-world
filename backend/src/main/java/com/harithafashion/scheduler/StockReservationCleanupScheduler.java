package com.harithafashion.scheduler;

import com.harithafashion.repository.ProductVariantRepository;
import com.harithafashion.repository.StockReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockReservationCleanupScheduler {

    private final StockReservationRepository reservationRepository;
    private final ProductVariantRepository variantRepository;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void cleanupExpiredReservations() {
        var expired = reservationRepository.findByExpiresAtBefore(LocalDateTime.now());
        for (var r : expired) {
            if (r.getOrderId() != null) continue;
            variantRepository.findById(r.getVariant().getId()).ifPresent(v -> {
                v.setReservedQuantity(Math.max(0, v.getReservedQuantity() - r.getQuantity()));
                variantRepository.save(v);
            });
            reservationRepository.delete(r);
        }
        if (!expired.isEmpty()) {
            log.debug("Cleaned up {} expired stock reservations", expired.size());
        }
    }
}
