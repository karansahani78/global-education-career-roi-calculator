package com.roicalculator.repository;

import com.roicalculator.domain.entity.CostOfLiving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CostOfLiving Repository
 */
@Repository
interface CostOfLivingRepository extends JpaRepository<CostOfLiving, Long> {
    List<CostOfLiving> findByCountryId(Long countryId);

    List<CostOfLiving> findByCountryIdAndCityIsNull(Long countryId);

    Optional<CostOfLiving> findByCountryIdAndCityAndYear(Long countryId, String city, Integer year);

    @Query("SELECT c FROM CostOfLiving c WHERE c.country.id = :countryId " +
            "AND c.year = :year ORDER BY c.city NULLS FIRST")
    List<CostOfLiving> findByCountryAndYearOrderByCity(@Param("countryId") Long countryId, @Param("year") Integer year);
}
