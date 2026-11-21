package com.roicalculator.repository;

import com.roicalculator.domain.entity.AdZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AdZone Repository
 */
@Repository
interface AdZoneRepository extends JpaRepository<AdZone, Long> {
    List<AdZone> findByIsActiveTrueOrderByPriorityDesc();

    List<AdZone> findByPageTypeAndIsActiveTrue(String pageType);

    Optional<AdZone> findByZoneName(String zoneName);
}
