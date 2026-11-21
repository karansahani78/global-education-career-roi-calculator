package com.roicalculator.repository;

import com.roicalculator.domain.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Faq Repository
 */
@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findBySeoPageIdOrderByDisplayOrderAsc(Long seoPageId);
}
