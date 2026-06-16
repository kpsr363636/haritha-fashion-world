package com.harithafashion.controller;

import com.harithafashion.dto.request.AddressRequest;
import com.harithafashion.dto.response.AddressResponse;
import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.security.UserPrincipal;
import com.harithafashion.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> list(@AuthenticationPrincipal UserPrincipal p) {
        return ApiResponse.ok(addressService.getUserAddresses(p.getId()));
    }

    @PostMapping
    public ApiResponse<AddressResponse> create(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody AddressRequest req) {
        return ApiResponse.ok(addressService.create(p.getId(), req));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> update(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID id, @Valid @RequestBody AddressRequest req) {
        return ApiResponse.ok(addressService.update(p.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID id) {
        addressService.delete(p.getId(), id);
        return ApiResponse.ok(null);
    }

    @PutMapping("/{id}/set-default")
    public ApiResponse<AddressResponse> setDefault(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID id) {
        return ApiResponse.ok(addressService.setDefault(p.getId(), id));
    }
}
