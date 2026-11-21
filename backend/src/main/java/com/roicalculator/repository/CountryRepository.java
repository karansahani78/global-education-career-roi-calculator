package com.roicalculator.repository;

import com.roicalculator.domain.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Country Repository
 */
@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByCode(String code);
    List<Country> findByRegion(String region);
    List<Country> findByIsActiveTrue();
    boolean existsByCode(String code);
}

