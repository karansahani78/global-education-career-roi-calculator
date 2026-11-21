package com.roicalculator.repository;

import com.roicalculator.domain.entity.TaxRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TaxRule Repository
 */
@Repository
interface TaxRuleRepository extends JpaRepository<TaxRule, Long> {
    List<TaxRule> findByCountryIdAndYear(Long countryId, Integer year);

    @Query("SELECT t FROM TaxRule t WHERE t.country.id = :countryId AND t.year = :year " +
            "AND :income >= t.incomeBracketMin AND :income < t.incomeBracketMax")
    Optional<TaxRule> findApplicableTaxRule(
            @Param("countryId") Long countryId,
            @Param("year") Integer year,
            @Param("income") java.math.BigDecimal income);
}
