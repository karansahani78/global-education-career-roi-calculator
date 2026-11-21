package com.roicalculator.repository;

import com.roicalculator.domain.entity.SeoPage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * SeoPage Repository
 */
@Repository
public interface SeoPageRepository extends JpaRepository<SeoPage, Long> {
    Optional<SeoPage> findBySlug(String slug);

    List<SeoPage> findByPageType(String pageType);

    List<SeoPage> findByIsPublishedTrue();

    Page<SeoPage> findByCountryIdAndMajorId(Long countryId, Long majorId, Pageable pageable);

    @Query("SELECT s FROM SeoPage s WHERE s.isPublished = true ORDER BY s.viewCount DESC")
    List<SeoPage> findTopViewedPages(Pageable pageable);
}
