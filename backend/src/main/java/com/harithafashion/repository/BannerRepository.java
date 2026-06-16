package com.harithafashion.repository;

import com.harithafashion.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BannerRepository extends JpaRepository<Banner, UUID> {

    List<Banner> findByPositionAndIsActiveTrueOrderBySortOrderAsc(String position);

    List<Banner> findByIsActiveTrueOrderBySortOrderAsc();

    @Query("SELECT b FROM Banner b WHERE b.isActive = true AND b.position = :position AND " +
           "(b.validFrom IS NULL OR b.validFrom <= :now) AND " +
           "(b.validUntil IS NULL OR b.validUntil >= :now) ORDER BY b.sortOrder ASC")
    List<Banner> findActiveBannersByPosition(@Param("position") String position, @Param("now") LocalDateTime now);

    List<Banner> findAllByOrderBySortOrderAsc();
}
