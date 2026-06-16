package com.harithafashion.repository;

import com.harithafashion.entity.ProductAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductAnswerRepository extends JpaRepository<ProductAnswer, UUID> {

    List<ProductAnswer> findByQuestionIdOrderByCreatedAtAsc(UUID questionId);

    Optional<ProductAnswer> findByQuestionIdAndIsSellerAnswerTrue(UUID questionId);

    long countByQuestionId(UUID questionId);

    void deleteByQuestionId(UUID questionId);
}
