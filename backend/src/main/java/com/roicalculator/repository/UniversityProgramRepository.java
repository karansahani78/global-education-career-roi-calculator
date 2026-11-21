package com.roicalculator.repository;

import com.roicalculator.domain.entity.UniversityProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UniversityProgram Repository
 */
@Repository
interface UniversityProgramRepository extends JpaRepository<UniversityProgram, Long> {
    List<UniversityProgram> findByUniversityId(Long universityId);

    List<UniversityProgram> findByMajorId(Long majorId);

    List<UniversityProgram> findByUniversityIdAndMajorIdAndDegreeLevelId(
            Long universityId, Long majorId, Long degreeLevelId);

    @Query("SELECT up FROM UniversityProgram up WHERE up.university.country.id = :countryId AND up.major.id = :majorId")
    List<UniversityProgram> findByCountryAndMajor(@Param("countryId") Long countryId, @Param("majorId") Long majorId);
}
