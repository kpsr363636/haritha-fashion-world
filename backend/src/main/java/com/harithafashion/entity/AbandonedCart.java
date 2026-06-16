package com.harithafashion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "abandoned_carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbandonedCart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cart_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> cartSnapshot;

    @Column(name = "reminder_1h_sent")
    @Builder.Default
    private Boolean reminder1hSent = false;

    @Column(name = "reminder_24h_sent")
    @Builder.Default
    private Boolean reminder24hSent = false;

    @Builder.Default
    private Boolean recovered = false;

    @CreationTimestamp
    @Column(name = "abandoned_at", updatable = false)
    private LocalDateTime abandonedAt;
}
