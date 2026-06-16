package com.harithafashion.repository;

import com.harithafashion.entity.SizeGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SizeGuideRepository extends JpaRepository<SizeGuide, UUID> {

    List<SizeGuide> findByCategoryId(UUID categoryId);

    Optional<SizeGuide> findByCategoryIdAndGuideType(UUID categoryId, String guideType);

    List<SizeGuide> findByGuideType(String guideType);
}
