package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Country Entity
 * Stores global country data with economic indicators
 */
@Entity
@Table(name = "countries", indexes = {
    @Index(name = "idx_countries_code", columnList = "code"),
    @Index(name = "idx_countries_region", columnList = "region")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country extends BaseEntity {

    @Column(length = 3, unique = true, nullable = false)
    private String code; // ISO 3166-1 alpha-3 (USA, GBR, CAN, etc.)

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 50)
    private String region; // North America, Europe, Asia, etc.

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode; // USD, GBP, EUR, etc.

    @Column(name = "avg_tax_rate", precision = 5, scale = 2)
    private BigDecimal avgTaxRate; // Average income tax rate percentage

    @Column(name = "gdp_per_capita", precision = 12, scale = 2)
    private BigDecimal gdpPerCapita; // GDP per capita in USD

    @Column(name = "cost_of_living_index", precision = 6, scale = 2)
    private BigDecimal costOfLivingIndex; // Base 100 (New York = 100)

    @Column(name = "education_quality_index", precision = 5, scale = 2)
    private BigDecimal educationQualityIndex; // 0-100 scale

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Override
    public String toString() {
        return "Country{" +
                "id=" + getId() +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", region='" + region + '\'' +
                '}';
    }
}
