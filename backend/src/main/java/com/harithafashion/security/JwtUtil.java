package com.harithafashion.security;

import com.harithafashion.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expiryMillis;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-days}") int expiryDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMillis = (long) expiryDays * 24 * 60 * 60 * 1000;
    }

    public String generateToken(UUID userId, String mobile, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMillis);
        return Jwts.builder()
                .setId(UUID.randomUUID().toString())   // jti claim for blacklisting
                .setSubject(userId.toString())
                .claim("mobile", mobile)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /** Returns the jti (unique token ID) for blacklisting, null if absent. */
    public String getJti(String token) {
        try {
            return parseClaims(token).getId();
        } catch (Exception e) {
            return null;
        }
    }

    /** Returns remaining TTL in milliseconds (0 if expired). */
    public long getRemainingTtlMs(String token) {
        try {
            Date exp = parseClaims(token).getExpiration();
            long remaining = exp.getTime() - System.currentTimeMillis();
            return Math.max(remaining, 0);
        } catch (Exception e) {
            return 0;
        }
    }

    public String refreshToken(String token) {
        Claims claims = parseClaims(token);
        return generateToken(
                UUID.fromString(claims.getSubject()),
                claims.get("mobile", String.class),
                claims.get("role", String.class));
    }

    /** Short-lived (30 min) impersonation token with read-only marker. */
    public String generateImpersonationToken(User target) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 30 * 60 * 1000L);
        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(target.getId().toString())
                .claim("mobile", target.getMobile())
                .claim("role", target.getRole().name())
                .claim("impersonation", true)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isImpersonation(String token) {
        try {
            Boolean flag = parseClaims(token).get("impersonation", Boolean.class);
            return Boolean.TRUE.equals(flag);
        } catch (Exception e) {
            return false;
        }
    }
}
