package com.harithafashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(length = 30)
    private String size;

    @Column(length = 60)
    private String color;

    @Column(name = "color_hex", length = 10)
    private String colorHex;

    @Column(length = 80)
    private String material;

    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "additional_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    @Column(length = 100, unique = true)
    private String sku;

    @Column(name = "weight_grams")
    private Integer weightGrams;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
