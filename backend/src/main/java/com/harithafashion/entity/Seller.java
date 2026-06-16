package com.harithafashion.entity;

import com.harithafashion.entity.enums.SellerStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sellers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "business_name", length = 150, nullable = false)
    private String businessName;

    @Column(name = "business_type", length = 50)
    private String businessType;

    @Column(name = "gst_number", length = 20)
    private String gstNumber;

    @Column(name = "pan_number", length = 15)
    private String panNumber;

    @Column(name = "bank_account_number", length = 30)
    private String bankAccountNumber;

    @Column(name = "bank_ifsc", length = 15)
    private String bankIfsc;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_holder_name", length = 100)
    private String accountHolderName;

    @Column(name = "razorpay_contact_id", length = 100)
    private String razorpayContactId;

    @Column(name = "razorpay_fund_account_id", length = 100)
    private String razorpayFundAccountId;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("10.00");

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private SellerStatus status = SellerStatus.PENDING;

    @Column(name = "kyc_verified")
    @Builder.Default
    private Boolean kycVerified = false;

    @Column(name = "total_sales", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Column(name = "pending_payout", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pendingPayout = BigDecimal.ZERO;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "fulfillment_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal fulfillmentRate = new BigDecimal("100");

    @Column(name = "return_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal returnRate = BigDecimal.ZERO;

    @Column(name = "response_time_hours")
    @Builder.Default
    private Integer responseTimeHours = 24;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
