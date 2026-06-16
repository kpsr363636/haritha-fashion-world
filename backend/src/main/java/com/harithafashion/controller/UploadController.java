package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    private final S3Service s3Service;

    @PostMapping("/image")
    public ApiResponse<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) throws Exception {
        return ApiResponse.ok(s3Service.upload(file, "images"));
    }

    @PostMapping("/video")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Map<String, String>> uploadVideo(
            @RequestParam("file") MultipartFile file) throws Exception {
        return ApiResponse.ok(s3Service.upload(file, "videos"));
    }

    @PostMapping("/presigned-url")
    public ApiResponse<Map<String, String>> presigned(
            @RequestBody Map<String, String> body) {
        String fileName = body.get("fileName");
        String contentType = body.get("contentType");
        if (fileName == null || contentType == null) {
            throw new IllegalArgumentException("fileName and contentType are required");
        }
        return ApiResponse.ok(s3Service.presignedUrl(fileName, contentType));
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ApiResponse<Void> delete(@RequestBody Map<String, String> body) {
        s3Service.delete(body.get("key"));
        return ApiResponse.ok(null);
    }
}
