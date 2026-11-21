package com.roicalculator.repository;

import com.roicalculator.domain.entity.University;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * University Repository
 */
@Repository
public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findBySlug(String slug);

    List<University> findByCountryId(Long countryId);

    List<University> findByCountryIdAndIsActiveTrue(Long countryId);

    Page<University> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT u FROM University u WHERE u.ranking IS NOT NULL ORDER BY u.ranking ASC")
    List<University> findTopRankedUniversities(Pageable pageable);
}
