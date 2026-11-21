package com.roicalculator.repository;

import com.roicalculator.domain.entity.SalaryStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SalaryStatistics Repository
 */
@Repository
interface SalaryStatisticsRepository extends JpaRepository<SalaryStatistics, Long> {
    List<SalaryStatistics> findByCountryIdAndMajorId(Long countryId, Long majorId);

    List<SalaryStatistics> findByCountryIdAndMajorIdAndYear(Long countryId, Long majorId, Integer year);

    @Query("SELECT s FROM SalaryStatistics s WHERE s.country.id = :countryId " +
            "AND s.major.id = :majorId AND s.degreeLevel.id = :degreeLevelId " +
            "AND s.experienceLevel = :experienceLevel ORDER BY s.year DESC")
    List<SalaryStatistics> findLatestSalaryData(
            @Param("countryId") Long countryId,
            @Param("majorId") Long majorId,
            @Param("degreeLevelId") Long degreeLevelId,
            @Param("experienceLevel") String experienceLevel);
}
