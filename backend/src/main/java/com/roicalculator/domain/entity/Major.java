package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Major Entity
 * Academic fields/majors of study
 */
@Entity
@Table(name = "majors", indexes = {
    @Index(name = "idx_majors_slug", columnList = "slug"),
    @Index(name = "idx_majors_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Major extends BaseEntity {

    @Column(length = 200, nullable = false)
    private String name; // Computer Science, Business Administration, etc.

    @Column(length = 200, unique = true, nullable = false)
    private String slug; // computer-science, business-administration

    @Column(length = 100)
    private String category; // STEM, Business, Arts, Healthcare, Engineering, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "avg_global_salary", precision = 12, scale = 2)
    private BigDecimal avgGlobalSalary; // Average salary in USD

    @Column(name = "job_growth_rate", precision = 5, scale = 2)
    private BigDecimal jobGrowthRate; // Percentage growth projection

    @Column(name = "demand_score", precision = 3, scale = 0)
    private BigDecimal demandScore; // 0-100 job market demand score

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Override
    public String toString() {
        return "Major{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", slug='" + slug + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}
