package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * SalaryStatistics Entity
 * Salary data by country, major, degree level, and experience
 */
@Entity
@Table(name = "salary_statistics", indexes = {
    @Index(name = "idx_salary_stats_country_major", columnList = "country_id, major_id"),
    @Index(name = "idx_salary_stats_year", columnList = "year")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStatistics extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id", nullable = false)
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_level_id", nullable = false)
    private DegreeLevel degreeLevel;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel; // Entry, Mid, Senior, Expert

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_avg", precision = 12, scale = 2)
    private BigDecimal salaryAvg;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode;

    @Column(nullable = false)
    private Integer year; // Data year

    @Column(length = 200)
    private String source; // Data source reference

    @Override
    public String toString() {
        return "SalaryStatistics{" +
                "id=" + getId() +
                ", country=" + (country != null ? country.getName() : "null") +
                ", major=" + (major != null ? major.getName() : "null") +
                ", salaryAvg=" + salaryAvg +
                ", year=" + year +
                '}';
    }
}
