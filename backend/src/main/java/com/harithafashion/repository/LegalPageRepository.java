package com.harithafashion.repository;

import com.harithafashion.entity.LegalPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LegalPageRepository extends JpaRepository<LegalPage, UUID> {

    Optional<LegalPage> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
