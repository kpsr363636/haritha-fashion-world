package com.harithafashion.repository;

import com.harithafashion.entity.ProductVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVideoRepository extends JpaRepository<ProductVideo, UUID> {

    List<ProductVideo> findByProductIdOrderByCreatedAtAsc(UUID productId);

    void deleteByProductId(UUID productId);
}
