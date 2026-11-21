package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * UniversityProgram Entity
 * Specific programs offered by universities (Major + Degree Level)
 */
@Entity
@Table(name = "university_programs", 
       indexes = {
           @Index(name = "idx_programs_university", columnList = "university_id"),
           @Index(name = "idx_programs_major", columnList = "major_id")
       },
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"university_id", "major_id", "degree_level_id"})
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UniversityProgram extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id", nullable = false)
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_level_id", nullable = false)
    private DegreeLevel degreeLevel;

    @Column(name = "tuition_annual", precision = 12, scale = 2)
    private BigDecimal tuitionAnnual; // Program-specific tuition

    @Column(name = "duration_years", precision = 3, scale = 1)
    private BigDecimal durationYears; // Can be 3.5, 4.0, etc.

    @Column(name = "avg_graduate_salary", precision = 12, scale = 2)
    private BigDecimal avgGraduateSalary; // In local currency

    @Column(name = "currency_code", length = 3, nullable = false)
    private String currencyCode;

    @Column(name = "employment_rate", precision = 5, scale = 2)
    private BigDecimal employmentRate; // % employed within 6 months

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Override
    public String toString() {
        return "UniversityProgram{" +
                "id=" + getId() +
                ", university=" + (university != null ? university.getName() : "null") +
                ", major=" + (major != null ? major.getName() : "null") +
                ", degreeLevel=" + (degreeLevel != null ? degreeLevel.getName() : "null") +
                '}';
    }
}
