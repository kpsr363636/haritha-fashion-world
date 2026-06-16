package com.harithafashion.repository;

import com.harithafashion.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {

    Optional<Referral> findByRefereeId(UUID refereeId);

    boolean existsByRefereeId(UUID refereeId);

    List<Referral> findByReferrerIdOrderByCreatedAtDesc(UUID referrerId);

    List<Referral> findByReferrerIdAndStatus(UUID referrerId, String status);

    long countByReferrerIdAndStatus(UUID referrerId, String status);
}
