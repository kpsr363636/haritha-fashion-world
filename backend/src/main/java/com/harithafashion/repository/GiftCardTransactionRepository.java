package com.harithafashion.repository;

import com.harithafashion.entity.GiftCardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GiftCardTransactionRepository extends JpaRepository<GiftCardTransaction, UUID> {

    List<GiftCardTransaction> findByGiftCardIdOrderByCreatedAtDesc(UUID giftCardId);

    List<GiftCardTransaction> findByOrderId(UUID orderId);

    List<GiftCardTransaction> findByGiftCardIdAndType(UUID giftCardId, String type);
}
