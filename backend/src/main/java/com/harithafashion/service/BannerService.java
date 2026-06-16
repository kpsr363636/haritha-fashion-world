package com.harithafashion.service;

import com.harithafashion.dto.request.BannerRequest;
import com.harithafashion.entity.Banner;
import com.harithafashion.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> getActiveByPosition(String position) {
        return bannerRepository.findActiveBannersByPosition(position, LocalDateTime.now());
    }

    public List<Banner> listAll() {
        return bannerRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public Banner create(BannerRequest req) {
        return bannerRepository.save(Banner.builder()
                .title(req.getTitle()).subtitle(req.getSubtitle())
                .imageUrl(req.getImageUrl()).mobileImageUrl(req.getMobileImageUrl())
                .linkUrl(req.getLinkUrl()).position(req.getPosition() != null ? req.getPosition() : "HOME_HERO")
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .validFrom(req.getValidFrom()).validUntil(req.getValidUntil()).build());
    }

    @Transactional
    public Banner update(UUID id, BannerRequest req) {
        Banner b = bannerRepository.findById(id).orElseThrow();
        if (req.getTitle() != null) b.setTitle(req.getTitle());
        if (req.getSubtitle() != null) b.setSubtitle(req.getSubtitle());
        if (req.getImageUrl() != null) b.setImageUrl(req.getImageUrl());
        if (req.getMobileImageUrl() != null) b.setMobileImageUrl(req.getMobileImageUrl());
        if (req.getLinkUrl() != null) b.setLinkUrl(req.getLinkUrl());
        if (req.getPosition() != null) b.setPosition(req.getPosition());
        if (req.getIsActive() != null) b.setIsActive(req.getIsActive());
        if (req.getSortOrder() != null) b.setSortOrder(req.getSortOrder());
        if (req.getValidFrom() != null) b.setValidFrom(req.getValidFrom());
        if (req.getValidUntil() != null) b.setValidUntil(req.getValidUntil());
        return bannerRepository.save(b);
    }

    @Transactional
    public void delete(UUID id) {
        bannerRepository.deleteById(id);
    }
}
