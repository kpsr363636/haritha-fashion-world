package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.dto.response.CategoryResponse;
import com.harithafashion.entity.SizeGuide;
import com.harithafashion.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getTree() {
        return ApiResponse.ok(categoryService.getCategoryTree());
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(categoryService.getBySlug(slug));
    }

    @GetMapping("/{id}/size-guide")
    public ApiResponse<SizeGuide> getSizeGuide(@PathVariable UUID id) {
        return ApiResponse.ok(categoryService.getSizeGuide(id));
    }
}
