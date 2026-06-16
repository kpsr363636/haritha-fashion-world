package com.harithafashion.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.cloudfront-domain:}")
    private String cloudfrontDomain;

    @Value("${aws.region}")
    private String region;

    public Map<String, String> upload(MultipartFile file, String folder) throws IOException {
        String key = folder + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        try {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (Exception e) {
            log.warn("S3 upload failed, using local placeholder: {}", e.getMessage());
            return Map.of("url", "https://via.placeholder.com/400x600?text=Haritha", "key", key);
        }
        return Map.of("url", buildUrl(key), "key", key);
    }

    public Map<String, String> presignedUrl(String fileName, String contentType) {
        String key = "uploads/" + UUID.randomUUID() + "-" + fileName;
        try (S3Presigner presigner = S3Presigner.create()) {
            var presigned = presigner.presignPutObject(PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .putObjectRequest(b -> b.bucket(bucket).key(key).contentType(contentType))
                    .build());
            return Map.of("uploadUrl", presigned.url().toString(), "key", key, "publicUrl", buildUrl(key));
        } catch (Exception e) {
            log.warn("Presign failed: {}", e.getMessage());
            return Map.of("uploadUrl", "", "key", key, "publicUrl", buildUrl(key));
        }
    }

    private String buildUrl(String key) {
        if (cloudfrontDomain != null && !cloudfrontDomain.isBlank()) {
            return cloudfrontDomain.replaceAll("/$", "") + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }
}
