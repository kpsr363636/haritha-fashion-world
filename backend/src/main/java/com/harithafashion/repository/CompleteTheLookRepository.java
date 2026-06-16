package com.harithafashion.repository;

import com.harithafashion.entity.CompleteTheLook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompleteTheLookRepository extends JpaRepository<CompleteTheLook, UUID> {

    List<CompleteTheLook> findByPrimaryProductIdOrderBySortOrderAsc(UUID primaryProductId);

    List<CompleteTheLook> findBySuggestedProductId(UUID suggestedProductId);

    boolean existsByPrimaryProductIdAndSuggestedProductId(UUID primaryProductId, UUID suggestedProductId);

    void deleteByPrimaryProductIdAndSuggestedProductId(UUID primaryProductId, UUID suggestedProductId);

    void deleteByPrimaryProductId(UUID primaryProductId);
}
