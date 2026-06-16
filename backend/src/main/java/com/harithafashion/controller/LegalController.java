package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.entity.LegalPage;
import com.harithafashion.repository.LegalPageRepository;
import com.harithafashion.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/legal")
@RequiredArgsConstructor
public class LegalController {

    private final LegalPageRepository legalPageRepository;

    @GetMapping("/{slug}")
    public ApiResponse<LegalPage> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(legalPageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found")));
    }
}
