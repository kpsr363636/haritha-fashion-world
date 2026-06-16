package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {
    private final SupportService supportService;

    @PostMapping("/tickets")
    public ApiResponse<?> create(@AuthenticationPrincipal UserPrincipal p, @RequestBody Map<String, String> body) {
        UUID orderId = body.get("orderId") != null ? UUID.fromString(body.get("orderId")) : null;
        return ApiResponse.ok(supportService.createTicket(p.getId(), body.get("category"), body.get("subject"), body.get("message"), orderId));
    }

    @GetMapping("/tickets")
    public ApiResponse<?> list(@AuthenticationPrincipal UserPrincipal p, @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.ok(supportService.getUserTickets(p.getId(), page, 10));
    }
}
