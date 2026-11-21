package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * SeoPage Entity
 * Programmatic SEO pages for traffic generation
 * Critical for organic growth and AdSense revenue
 */
@Entity
@Table(name = "seo_pages", indexes = {
    @Index(name = "idx_seo_pages_slug", columnList = "slug"),
    @Index(name = "idx_seo_pages_type", columnList = "page_type"),
    @Index(name = "idx_seo_pages_country", columnList = "country_id"),
    @Index(name = "idx_seo_pages_major", columnList = "major_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeoPage extends BaseEntity {

    @Column(length = 500, unique = true, nullable = false)
    private String slug; // /roi/usa/computer-science, /roi/canada/mba

    @Column(name = "page_type", length = 50)
    private String pageType; // country_major, country_degree, university_major, comparison

    // ===== SEO Metadata =====
    @Column(name = "meta_title", length = 200, nullable = false)
    private String metaTitle;

    @Column(name = "meta_description", length = 500)
    private String metaDescription;

    @Column(name = "h1_title", length = 200)
    private String h1Title;

    @Column(name = "canonical_url", length = 500)
    private String canonicalUrl;

    // ===== Content References =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_level_id")
    private DegreeLevel degreeLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    // ===== Pre-filled Calculator Data (JSON) =====
    @Column(name = "default_params", columnDefinition = "jsonb")
    private String defaultParams; // Stored as JSON string, parsed in service layer

    // ===== Analytics =====
    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "calculation_count")
    private Long calculationCount = 0L;

    // ===== Status =====
    @Column(name = "is_published")
    private Boolean isPublished = true;

    @Column(name = "last_crawled")
    private LocalDateTime lastCrawled;

    @Override
    public String toString() {
        return "SeoPage{" +
                "id=" + getId() +
                ", slug='" + slug + '\'' +
                ", pageType='" + pageType + '\'' +
                ", metaTitle='" + metaTitle + '\'' +
                '}';
    }
}
