package com.harithafashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "complete_the_look")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTheLook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_product_id")
    private Product primaryProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_product_id")
    private Product suggestedProduct;

    @Column(name = "suggestion_type", length = 30)
    private String suggestionType;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
