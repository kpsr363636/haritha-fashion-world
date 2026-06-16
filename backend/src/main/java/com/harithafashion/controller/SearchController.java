package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.service.CategoryService;
import com.harithafashion.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {
    private final ProductService productService;
    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<Map<String, Object>> search(@RequestParam String q, @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(Map.of(
                "products", productService.searchProducts(q, null, null, null, null, "RELEVANCE", page, 10),
                "categories", categoryService.getCategoryTree()));
    }

    @GetMapping("/suggestions")
    public ApiResponse<?> suggestions(@RequestParam String q) {
        return ApiResponse.ok(productService.searchProducts(q, null, null, null, null, "RELEVANCE", 0, 5));
    }
}
