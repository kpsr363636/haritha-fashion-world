package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.entity.ProductQuestion;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.ProductQAService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/product-qa")
@RequiredArgsConstructor
public class ProductQAController {

    private final ProductQAService qaService;

    @GetMapping("/products/{productId}/questions")
    public ApiResponse<List<ProductQuestion>> questions(@PathVariable UUID productId) {
        return ApiResponse.ok(qaService.getQuestions(productId));
    }

    @PostMapping("/products/{productId}/questions")
    public ApiResponse<ProductQuestion> ask(@PathVariable UUID productId,
                                            @AuthenticationPrincipal UserPrincipal p,
                                            @RequestBody Map<String, String> body) {
        return ApiResponse.ok(qaService.askQuestion(productId, p.getId(), body.get("question")));
    }

    @PostMapping("/questions/{questionId}/answers")
    public ApiResponse<?> answer(@PathVariable UUID questionId,
                                 @AuthenticationPrincipal UserPrincipal p,
                                 @RequestBody Map<String, String> body) {
        return ApiResponse.ok(qaService.answerQuestion(questionId, p.getId(), body.get("answer"), false));
    }
}
