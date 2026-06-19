package com.harithafashion.service;

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

@Service
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.cloudfront-domain:}")
    private String cloudfrontDomain;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key-id:}")
    private String accessKeyId;

    @Value("${app.upload.local-enabled:true}")
    private boolean localEnabled;

    @Value("${app.upload.local-dir:../frontend/public/uploads}")
    private String localDir;

    @Value("${app.upload.local-base-url:http://localhost:5173/uploads}")
    private String localBaseUrl;

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public Map<String, String> upload(MultipartFile file, String folder) throws IOException {
        validateFile(file, folder);
        if (shouldUseLocalStorage()) {
            return uploadLocal(file, folder);
        }
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
            return Map.of("url", buildUrl(key), "key", key, "bucket", bucket);
        } catch (Exception e) {
            log.warn("S3 upload failed, using local storage: {}", e.getMessage());
            return uploadLocal(file, folder);
        }
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) return;
        if (shouldUseLocalStorage() || key.startsWith("/uploads") || key.contains("/uploads/")) {
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (S3Exception e) {
            log.warn("S3 delete failed for {}: {}", key, e.awsErrorDetails().errorMessage());
        }
    }

    public Map<String, String> presignedUrl(String fileName, String contentType) {
        if (shouldUseLocalStorage()) {
            throw new UnsupportedOperationException("Use multipart upload in local dev mode");
        }
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

    private boolean shouldUseLocalStorage() {
        return localEnabled && (accessKeyId == null || accessKeyId.isBlank());
    }

    private Map<String, String> uploadLocal(MultipartFile file, String folder) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(localDir, folder).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        Path target = dir.resolve(filename);
        Files.write(target, file.getBytes());
        String publicUrl = localBaseUrl.replaceAll("/$", "") + "/" + folder + "/" + filename;
        log.info("Local upload → {}", publicUrl);
        return Map.of("url", publicUrl, "key", folder + "/" + filename, "bucket", "local");
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
