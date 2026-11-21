package com.roicalculator.repository;

import com.roicalculator.domain.entity.Major;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Major Repository
 */
@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {
    Optional<Major> findBySlug(String slug);

    List<Major> findByCategory(String category);

    List<Major> findByIsActiveTrue();

    Page<Major> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String nameKeyword, String descKeyword, Pageable pageable);

    @Query("SELECT m FROM Major m ORDER BY m.demandScore DESC")
    List<Major> findTopMajorsByDemand(Pageable pageable);
}
