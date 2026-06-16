package com.harithafashion.service;

import com.harithafashion.entity.*;
import com.harithafashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public SupportTicket createTicket(UUID userId, String category, String subject, String message, UUID orderId) {
        User user = userRepository.findById(userId).orElseThrow();
        String ticketNumber = "TKT-" + System.currentTimeMillis() % 1000000;
        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber).user(user).category(category)
                .subject(subject).status("OPEN").build();
        if (orderId != null) orderRepository.findById(orderId).ifPresent(ticket::setOrder);
        ticket = ticketRepository.save(ticket);
        messageRepository.save(SupportMessage.builder()
                .ticket(ticket).sender(user).message(message).isStaff(false).build());
        return ticket;
    }

    public Page<SupportTicket> getUserTickets(UUID userId, int page, int size) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public SupportTicket getTicket(UUID ticketId) {
        return ticketRepository.findById(ticketId).orElseThrow();
    }

    @Transactional
    public SupportMessage addMessage(UUID ticketId, UUID senderId, String message, boolean isStaff) {
        SupportTicket ticket = ticketRepository.findById(ticketId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();
        return messageRepository.save(SupportMessage.builder()
                .ticket(ticket).sender(sender).message(message).isStaff(isStaff).build());
    }

    @Transactional
    public SupportTicket updateStatus(UUID ticketId, String status) {
        SupportTicket ticket = ticketRepository.findById(ticketId).orElseThrow();
        ticket.setStatus(status);
        if ("RESOLVED".equals(status)) ticket.setResolvedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Page<SupportTicket> getAllTickets(int page, int size) {
        return ticketRepository.findAll(PageRequest.of(page, size));
    }
}
