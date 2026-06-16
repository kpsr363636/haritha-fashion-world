package com.harithafashion.repository;

import com.harithafashion.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {

    Optional<SupportTicket> findByTicketNumber(String ticketNumber);

    boolean existsByTicketNumber(String ticketNumber);

    Page<SupportTicket> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<SupportTicket> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<SupportTicket> findByAssignedToAndStatus(String assignedTo, String status, Pageable pageable);

    Page<SupportTicket> findByOrderId(UUID orderId, Pageable pageable);

    @Query("SELECT st FROM SupportTicket st WHERE LOWER(st.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(st.ticketNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SupportTicket> searchTickets(@Param("keyword") String keyword, Pageable pageable);
}
