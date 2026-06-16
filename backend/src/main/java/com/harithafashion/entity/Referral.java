package com.harithafashion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "referrals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id")
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id")
    private User referee;

    @Column(name = "coupon_code", length = 30)
    private String couponCode;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "referrer_credit", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal referrerCredit = new BigDecimal("100");

    @Column(name = "referee_discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refereeDiscount = new BigDecimal("100");

    @Column(name = "credited_at")
    private LocalDateTime creditedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
