package com.harithafashion.controller;

import com.harithafashion.dto.response.ApiResponse;
import com.harithafashion.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {
    private final S3Service s3Service;

    @PostMapping("/image")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws Exception {
        return ApiResponse.ok(s3Service.upload(file, "images"));
    }

    @PostMapping("/presigned-url")
    public ApiResponse<Map<String, String>> presigned(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(s3Service.presignedUrl(body.get("fileName"), body.get("contentType")));
    }
}
