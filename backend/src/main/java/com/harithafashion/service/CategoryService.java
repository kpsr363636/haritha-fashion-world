package com.harithafashion.service;

import com.harithafashion.dto.response.CategoryResponse;
import com.harithafashion.entity.Category;
import com.harithafashion.entity.SizeGuide;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.CategoryRepository;
import com.harithafashion.repository.SizeGuideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SizeGuideRepository sizeGuideRepository;

    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toResponseWithChildren).toList();
    }

    public CategoryResponse getBySlug(String slug) {
        Category cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toResponseWithChildren(cat);
    }

    public SizeGuide getSizeGuide(UUID categoryId) {
        return sizeGuideRepository.findByCategoryId(categoryId).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Size guide not found"));
    }

    private CategoryResponse toResponseWithChildren(Category cat) {
        List<CategoryResponse> children = categoryRepository
                .findByParentIdAndIsActiveTrueOrderBySortOrderAsc(cat.getId())
                .stream().map(this::toResponse).toList();
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .slug(cat.getSlug())
                .description(cat.getDescription())
                .imageUrl(cat.getImageUrl())
                .iconName(cat.getIconName())
                .gstPercent(cat.getGstPercent())
                .children(children)
                .build();
    }

    private CategoryResponse toResponse(Category cat) {
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .slug(cat.getSlug())
                .description(cat.getDescription())
                .imageUrl(cat.getImageUrl())
                .iconName(cat.getIconName())
                .gstPercent(cat.getGstPercent())
                .build();
    }
}
