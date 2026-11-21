package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * CostOfLiving Entity
 * Monthly living costs by country and city
 */
@Entity
@Table(name = "cost_of_living", indexes = {
    @Index(name = "idx_col_country", columnList = "country_id"),
    @Index(name = "idx_col_city", columnList = "city")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostOfLiving extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(length = 100)
    private String city; // Specific city or null for country average

    @Column(name = "rent_monthly_avg", precision = 10, scale = 2)
    private BigDecimal rentMonthlyAvg;

    @Column(name = "food_monthly_avg", precision = 10, scale = 2)
    private BigDecimal foodMonthlyAvg;

    @Column(name = "transportation_monthly_avg", precision = 10, scale = 2)
    private BigDecimal transportationMonthlyAvg;

    @Column(name = "utilities_monthly_avg", precision = 10, scale = 2)
    private BigDecimal utilitiesMonthlyAvg;

    @Column(name = "other_expenses_monthly_avg", precision = 10, scale = 2)
    private BigDecimal otherExpensesMonthlyAvg;

    @Column(name = "total_monthly_avg", precision = 10, scale = 2)
    private BigDecimal totalMonthlyAvg;

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode;

    @Column(nullable = false)
    private Integer year;

    @Override
    public String toString() {
        return "CostOfLiving{" +
                "id=" + getId() +
                ", country=" + (country != null ? country.getName() : "null") +
                ", city='" + city + '\'' +
                ", totalMonthly=" + totalMonthlyAvg +
                ", year=" + year +
                '}';
    }
}
