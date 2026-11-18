package com.harithafashion.service;

import com.harithafashion.dto.response.CategoryResponse;
import com.harithafashion.dto.response.CategoryVariantSizesResponse;
import com.harithafashion.entity.Category;
import com.harithafashion.entity.SizeGuide;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.CategoryRepository;
import com.harithafashion.repository.SizeGuideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
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

    @Transactional(readOnly = true)
    public CategoryVariantSizesResponse getVariantSizes(UUID categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        List<String> fromGuide = findSizesFromGuides(cat);
        if (!fromGuide.isEmpty()) {
            return CategoryVariantSizesResponse.builder()
                    .label(sizeLabelForSlug(cat.getSlug()))
                    .guideType("SIZE_GUIDE")
                    .sizes(fromGuide)
                    .build();
        }
        return defaultsForSlug(cat.getSlug());
    }

    private List<String> findSizesFromGuides(Category cat) {
        Category current = cat;
        while (current != null) {
            List<SizeGuide> guides = sizeGuideRepository.findByCategoryId(current.getId());
            for (SizeGuide guide : guides) {
                List<String> extracted = extractSizesFromGuide(guide);
                if (!extracted.isEmpty()) return extracted;
            }
            current = current.getParent();
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSizesFromGuide(SizeGuide guide) {
        Map<String, Object> content = guide.getContent();
        if (content == null) return List.of();
        Object tablesObj = content.get("tables");
        if (!(tablesObj instanceof List<?> tables) || tables.isEmpty()) return List.of();
        LinkedHashSet<String> sizes = new LinkedHashSet<>();
        for (Object tableObj : tables) {
            if (!(tableObj instanceof Map<?, ?> table)) continue;
            Object headersObj = table.get("headers");
            Object rowsObj = table.get("rows");
            if (!(headersObj instanceof List<?> headers) || !(rowsObj instanceof List<?> rows)) continue;
            int sizeCol = -1;
            for (int i = 0; i < headers.size(); i++) {
                String h = String.valueOf(headers.get(i)).toLowerCase();
                if (h.contains("size") || h.contains("indian/uk") || h.equals("uk")) {
                    sizeCol = i;
                    break;
                }
            }
            if (sizeCol < 0) continue;
            for (Object rowObj : rows) {
                if (rowObj instanceof List<?> row && sizeCol < row.size()) {
                    String val = String.valueOf(row.get(sizeCol)).trim();
                    if (!val.isBlank()) sizes.add(val);
                }
            }
            if (!sizes.isEmpty()) break;
        }
        return new ArrayList<>(sizes);
    }

    private String sizeLabelForSlug(String slug) {
        return switch (slug) {
            case "footwear" -> "Shoe Size (UK/Indian)";
            case "fine-jewellery", "fashion-jewellery" -> "Bangle / Ring Size";
            case "bags-handbags" -> "Bag Size";
            case "watches-eyewear" -> "Size";
            default -> "Size";
        };
    }

    private CategoryVariantSizesResponse defaultsForSlug(String slug) {
        List<String> sizes = switch (slug) {
            case "footwear" -> List.of("3", "4", "5", "6", "7", "8", "9", "10");
            case "bags-handbags" -> List.of("One Size", "Mini", "Small", "Medium", "Large");
            case "fine-jewellery", "fashion-jewellery" -> List.of("2-2", "2-4", "2-6", "2-8", "2-10", "2-12", "Free Size");
            case "hair-accessories", "scarves-dupattas", "fashion-accessories" -> List.of("One Size", "Free Size");
            case "watches-eyewear" -> List.of("One Size", "Small", "Medium", "Large");
            case "beauty-skincare" -> List.of("50ml", "100ml", "200ml", "One Size");
            case "sarees-ethnic-wear" -> List.of("Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL");
            case "western-clothing" -> List.of("XS", "S", "M", "L", "XL", "XXL", "3XL");
            default -> List.of("XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size");
        };
        return CategoryVariantSizesResponse.builder()
                .label(sizeLabelForSlug(slug))
                .guideType("DEFAULT")
                .sizes(sizes)
                .build();
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
