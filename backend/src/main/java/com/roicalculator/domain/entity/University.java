package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * University Entity
 * Global universities and educational institutions
 */
@Entity
@Table(name = "universities", indexes = {
    @Index(name = "idx_universities_country", columnList = "country_id"),
    @Index(name = "idx_universities_slug", columnList = "slug"),
    @Index(name = "idx_universities_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class University extends BaseEntity {

    @Column(length = 300, nullable = false)
    private String name;

    @Column(length = 300, unique = true, nullable = false)
    private String slug; // harvard-university, mit, stanford-university

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(length = 100)
    private String city;

    @Column(length = 50)
    private String type; // Public, Private, Online

    @Column
    private Integer ranking; // World ranking

    @Column(name = "avg_tuition_annual", precision = 12, scale = 2)
    private BigDecimal avgTuitionAnnual; // Average annual tuition in local currency

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode;

    @Column(name = "acceptance_rate", precision = 5, scale = 2)
    private BigDecimal acceptanceRate; // Percentage

    @Column(name = "graduation_rate", precision = 5, scale = 2)
    private BigDecimal graduationRate; // Percentage

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Override
    public String toString() {
        return "University{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", slug='" + slug + '\'' +
                ", city='" + city + '\'' +
                '}';
    }
}
