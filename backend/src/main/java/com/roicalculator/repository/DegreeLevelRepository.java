package com.roicalculator.repository;

import com.roicalculator.domain.entity.DegreeLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DegreeLevel Repository
 */
@Repository
public interface DegreeLevelRepository extends JpaRepository<DegreeLevel, Long> {
    Optional<DegreeLevel> findBySlug(String slug);

    List<DegreeLevel> findAllByOrderByEducationLevelAsc();
}
