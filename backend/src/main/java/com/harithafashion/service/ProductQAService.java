package com.harithafashion.service;

import com.harithafashion.dto.response.SellerQuestionSummaryResponse;
import com.harithafashion.entity.*;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductQAService {

    private final ProductQuestionRepository questionRepository;
    private final ProductAnswerRepository answerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    public List<ProductQuestion> getQuestions(UUID productId) {
        return questionRepository.findByProductIdAndIsApprovedTrueOrderByCreatedAtDesc(
                productId, PageRequest.of(0, 50)).getContent();
    }

    @Transactional
    public ProductQuestion askQuestion(UUID productId, UUID userId, String question) {
        Product product = productRepository.findById(productId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        return questionRepository.save(ProductQuestion.builder()
                .product(product).user(user).question(question).isApproved(false).build());
    }

    @Transactional
    public ProductAnswer answerQuestion(UUID questionId, UUID userId, String answer, boolean isSeller) {
        ProductQuestion question = questionRepository.findById(questionId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        return answerRepository.save(ProductAnswer.builder()
                .question(question).answeredBy(user).answer(answer).isSellerAnswer(isSeller).build());
    }

    @Transactional
    public void approveQuestion(UUID questionId) {
        questionRepository.findById(questionId).ifPresent(q -> {
            q.setIsApproved(true);
            questionRepository.save(q);
        });
    }

    public Page<ProductQuestion> listPending(int page, int size) {
        return questionRepository.findByIsApprovedFalseOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Page<SellerQuestionSummaryResponse> listForSeller(UUID userId, int page, int size) {
        Seller seller = sellerRepository.findByUserId(userId).orElseThrow();
        return questionRepository.findBySellerId(seller.getId(), PageRequest.of(page, size))
                .map(this::toSummary);
    }

    private SellerQuestionSummaryResponse toSummary(ProductQuestion q) {
        return SellerQuestionSummaryResponse.builder()
                .id(q.getId())
                .productName(q.getProduct() != null ? q.getProduct().getName() : null)
                .question(q.getQuestion())
                .createdAt(q.getCreatedAt())
                .build();
    }
}
