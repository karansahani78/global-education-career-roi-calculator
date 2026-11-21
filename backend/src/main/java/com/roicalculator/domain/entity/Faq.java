package com.roicalculator.domain.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * FAQ Entity
 * FAQ content for SEO pages (schema markup support)
 */
@Entity
@Table(name = "faqs", indexes = {
    @Index(name = "idx_faqs_page", columnList = "seo_page_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seo_page_id")
    private SeoPage seoPage;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(length = 100)
    private String category;

    @Override
    public String toString() {
        return "Faq{" +
                "id=" + getId() +
                ", question='" + question + '\'' +
                '}';
    }
}
