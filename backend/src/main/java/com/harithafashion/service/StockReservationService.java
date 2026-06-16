package com.harithafashion.service;

import com.harithafashion.entity.ProductVariant;
import com.harithafashion.entity.StockReservation;
import com.harithafashion.entity.User;
import com.harithafashion.repository.ProductVariantRepository;
import com.harithafashion.repository.StockReservationRepository;
import com.harithafashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockReservationService {

    private static final int RESERVATION_MINUTES = 10;

    private final StockReservationRepository reservationRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Transactional
    public void reserve(UUID variantId, UUID userId, int quantity) {
        ProductVariant variant = variantRepository.findByIdForUpdate(variantId).orElseThrow();
        variant.setReservedQuantity(variant.getReservedQuantity() + quantity);
        variantRepository.save(variant);
        User user = userRepository.findById(userId).orElseThrow();
        reservationRepository.save(StockReservation.builder()
                .variant(variant)
                .user(user)
                .quantity(quantity)
                .expiresAt(LocalDateTime.now().plusMinutes(RESERVATION_MINUTES))
                .build());
    }

    @Transactional
    public void release(UUID variantId, UUID userId, int quantity) {
        variantRepository.findByIdForUpdate(variantId).ifPresent(variant -> {
            variant.setReservedQuantity(Math.max(0, variant.getReservedQuantity() - quantity));
            variantRepository.save(variant);
        });
        reservationRepository.findByVariantIdAndUserId(variantId, userId)
                .ifPresent(r -> {
                    if (r.getQuantity() <= quantity) {
                        reservationRepository.delete(r);
                    } else {
                        r.setQuantity(r.getQuantity() - quantity);
                        reservationRepository.save(r);
                    }
                });
    }

    @Transactional
    public void confirmSale(UUID variantId, int quantity) {
        ProductVariant variant = variantRepository.findByIdForUpdate(variantId).orElseThrow();
        variant.setStockQuantity(variant.getStockQuantity() - quantity);
        variant.setReservedQuantity(Math.max(0, variant.getReservedQuantity() - quantity));
        variantRepository.save(variant);
    }
}
