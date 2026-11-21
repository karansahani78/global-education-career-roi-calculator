package com.roicalculator.repository;

import com.roicalculator.domain.entity.RoiCalculation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * RoiCalculation Repository
 */
@Repository
public interface RoiCalculationRepository extends JpaRepository<RoiCalculation, Long> {

    Optional<RoiCalculation> findByUuid(String uuid);

    Page<RoiCalculation> findByCountryId(Long countryId, Pageable pageable);

    Page<RoiCalculation> findByMajorId(Long majorId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM RoiCalculation r WHERE r.country.id = :countryId")
    Long countByCountryId(@Param("countryId") Long countryId);

    @Query("""
        SELECT r.major.id, COUNT(r) as count
        FROM RoiCalculation r
        GROUP BY r.major.id
        ORDER BY count DESC
    """)
    List<Object[]> findMostCalculatedMajors(Pageable pageable);

    // ✅ FIXED: Hibernate 6 compatible
    @Query("""
        SELECT r
        FROM RoiCalculation r
        WHERE r.calculatedAt >= :fromDate
        ORDER BY r.calculatedAt DESC
    """)
    List<RoiCalculation> findRecentCalculations(
            @Param("fromDate") LocalDateTime fromDate,
            Pageable pageable
    );
}
