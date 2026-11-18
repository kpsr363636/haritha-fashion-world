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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * File storage. {@code storage.type=local} writes to {@code storage.local.dir} (served by the
 * reverse proxy under {@code storage.public-url}); {@code storage.type=s3} uses any S3-compatible
 * bucket (AWS S3, Cloudflare R2).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${storage.type:s3}")
    private String storageType;

    @Value("${storage.local.dir:/data/media}")
    private String localDir;

    @Value("${storage.public-url:}")
    private String publicUrl;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.cloudfront-domain:}")
    private String cloudfrontDomain;

    @Value("${aws.region}")
    private String region;

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100 MB

    private boolean isLocal() {
        return "local".equalsIgnoreCase(storageType);
    }

    public Map<String, String> upload(MultipartFile file, String folder) throws IOException {
        validateFile(file, folder);
        String ext = getExtension(file.getOriginalFilename());
        String key = folder + "/" + UUID.randomUUID() + ext;

        if (isLocal()) {
            Path target = resolveLocal(key);
            Files.createDirectories(target.getParent());
            file.transferTo(target);
            log.info("Stored {} bytes → {}", file.getSize(), target);
            return Map.of("url", buildUrl(key), "key", key, "bucket", "local");
        }

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
        if (isLocal()) {
            try {
                Files.deleteIfExists(resolveLocal(key));
                log.info("Deleted local file {}", key);
            } catch (IOException | IllegalArgumentException e) {
                log.warn("Local delete failed for {}: {}", key, e.getMessage());
            }
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            log.info("Deleted s3://{}/{}", bucket, key);
        } catch (S3Exception e) {
            log.warn("S3 delete failed for {}: {}", key, e.awsErrorDetails().errorMessage());
        }
    }

    public Map<String, String> presignedUrl(String fileName, String contentType) {
        if (isLocal()) {
            throw new IllegalStateException("Direct uploads are not available; use /upload/image or /upload/video");
        }
        String ext = getExtension(fileName);
        String key = "uploads/" + UUID.randomUUID() + ext;
        try {
            var presigned = s3Presigner.presignPutObject(PutObjectPresignRequest.builder()
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
        if (publicUrl != null && !publicUrl.isBlank()) {
            return publicUrl.replaceAll("/$", "") + "/" + key;
        }
        if (cloudfrontDomain != null && !cloudfrontDomain.isBlank()) {
            return cloudfrontDomain.replaceAll("/$", "") + "/" + key;
        }
        if (isLocal()) {
            return "/media/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    /** Resolves a storage key inside the local media dir, rejecting path traversal. */
    private Path resolveLocal(String key) {
        Path root = Paths.get(localDir).toAbsolutePath().normalize();
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Invalid file key");
        }
        return target;
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
        String ext = filename.substring(filename.lastIndexOf('.'));
        // keep only safe extension characters
        return ext.matches("\\.[A-Za-z0-9]{1,8}") ? ext.toLowerCase() : "";
    }
}
