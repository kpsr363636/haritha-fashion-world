package com.harithafashion.service;

import com.harithafashion.entity.GiftCard;
import com.harithafashion.entity.GiftCardTransaction;
import com.harithafashion.entity.User;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.GiftCardRepository;
import com.harithafashion.repository.GiftCardTransactionRepository;
import com.harithafashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftCardService {

    private final GiftCardRepository giftCardRepository;
    private final GiftCardTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public BigDecimal getBalance(String code) {
        return findActiveCard(code).getRemainingAmount();
    }

    public java.util.List<GiftCard> listMine(UUID userId) {
        return giftCardRepository.findByIssuedToUserId(userId);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal orderTotal) {
        GiftCard card = findActiveCard(code);
        return card.getRemainingAmount().min(orderTotal);
    }

    private GiftCard findActiveCard(String code) {
        GiftCard card = giftCardRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Invalid gift card"));
        if (card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDate.now())) {
            throw new BadRequestException("Gift card expired");
        }
        return card;
    }

    @Transactional
    public GiftCard purchase(UUID userId, BigDecimal amount) {
        User user = userRepository.findById(userId).orElseThrow();
        String code = "HF" + random.nextInt(1_000_000_000);
        return giftCardRepository.save(GiftCard.builder()
                .code(code).initialAmount(amount).remainingAmount(amount)
                .issuedToUser(user).expiresAt(LocalDate.now().plusYears(1)).build());
    }

    @Transactional
    public BigDecimal apply(String code, UUID orderId, BigDecimal orderTotal) {
        GiftCard card = findActiveCard(code);
        BigDecimal applied = card.getRemainingAmount().min(orderTotal);
        card.setRemainingAmount(card.getRemainingAmount().subtract(applied));
        giftCardRepository.save(card);
        transactionRepository.save(GiftCardTransaction.builder()
                .giftCard(card).amount(applied).type("REDEEM").build());
        return applied;
    }
}
