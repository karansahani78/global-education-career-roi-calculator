package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * DegreeLevel Entity
 * Academic degree levels (Bachelor's, Master's, PhD, etc.)
 */
@Entity
@Table(name = "degree_levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DegreeLevel extends BaseEntity {

    @Column(length = 100, nullable = false)
    private String name; // Bachelor's, Master's, PhD, Diploma, Certificate, etc.

    @Column(length = 100, unique = true, nullable = false)
    private String slug; // bachelors, masters, phd, diploma

    @Column(name = "typical_duration_years", nullable = false)
    private Integer typicalDurationYears; // 3, 4, 2, 5, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "education_level") // 1=Certificate, 2=Diploma, 3=Bachelor's, 4=Master's, 5=PhD
    private Integer educationLevel;

    @Override
    public String toString() {
        return "DegreeLevel{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", slug='" + slug + '\'' +
                ", duration=" + typicalDurationYears +
                '}';
    }
}
