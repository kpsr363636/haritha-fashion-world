package com.harithafashion.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
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

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100 MB

    public Map<String, String> upload(MultipartFile file, String folder) throws IOException {
        validateFile(file, folder);
        String ext = getExtension(file.getOriginalFilename());
        String key = folder + "/" + UUID.randomUUID() + ext;
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .cacheControl("public, max-age=31536000")
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
            log.info("Uploaded {} bytes → s3://{}/{}", file.getSize(), bucket, key);
        } catch (S3Exception e) {
            log.error("S3 upload failed for key {}: {}", key, e.awsErrorDetails().errorMessage());
            throw new RuntimeException("File upload failed: " + e.awsErrorDetails().errorMessage(), e);
        }
        return Map.of("url", buildUrl(key), "key", key, "bucket", bucket);
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) return;
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            log.info("Deleted s3://{}/{}", bucket, key);
        } catch (S3Exception e) {
            log.warn("S3 delete failed for {}: {}", key, e.awsErrorDetails().errorMessage());
        }
    }

    public Map<String, String> presignedUrl(String fileName, String contentType) {
        String ext = getExtension(fileName);
        String key = "uploads/" + UUID.randomUUID() + ext;
        try (S3Presigner presigner = S3Presigner.builder()
                .region(software.amazon.awssdk.regions.Region.of(region))
                .build()) {
            var presigned = presigner.presignPutObject(PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .putObjectRequest(b -> b.bucket(bucket).key(key).contentType(contentType))
                    .build());
            return Map.of(
                    "uploadUrl", presigned.url().toString(),
                    "key", key,
                    "publicUrl", buildUrl(key),
                    "expiresInMinutes", "15");
        } catch (Exception e) {
            log.error("S3 presign failed: {}", e.getMessage());
            throw new RuntimeException("Could not generate upload URL", e);
        }
    }

    public String buildUrl(String key) {
        if (cloudfrontDomain != null && !cloudfrontDomain.isBlank()) {
            return cloudfrontDomain.replaceAll("/$", "") + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    private void validateFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new RuntimeException("File is empty");
        long maxSize = folder.startsWith("video") ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File exceeds maximum size of " + (maxSize / 1024 / 1024) + " MB");
        }
        String ct = file.getContentType();
        if (ct == null) throw new RuntimeException("Unknown file type");
        if (folder.startsWith("video") && !ct.startsWith("video/")) {
            throw new RuntimeException("Only video files allowed in this folder");
        }
        if (!folder.startsWith("video") && !ct.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
