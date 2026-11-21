package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * AffiliateProduct Entity
 * Affiliate products and services to promote
 */
@Entity
@Table(name = "affiliate_products", indexes = {
        @Index(name = "idx_affiliate_country", columnList = "country_id"),
        @Index(name = "idx_affiliate_major", columnList = "major_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AffiliateProduct extends BaseEntity {

    @Column(name = "product_type", length = 50)
    private String productType; // university, online_course, book, tool, scholarship

    @Column(length = 300, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "affiliate_url", length = 500)
    private String affiliateUrl;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate; // Percentage

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    @Column(name = "display_priority")
    private Integer displayPriority = 1;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Override
    public String toString() {
        return "AffiliateProduct{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", productType='" + productType + '\'' +
                '}';
    }
}
