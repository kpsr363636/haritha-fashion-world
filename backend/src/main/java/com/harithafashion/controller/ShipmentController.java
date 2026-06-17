package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Slf4j
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping("/shiprocket")
    public ApiResponse<Void> shiprocketWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Shiprocket webhook received: event={}", payload.get("event"));
        shipmentService.handleShiprocketWebhook(payload);
        return ApiResponse.ok(null);
    }
}
