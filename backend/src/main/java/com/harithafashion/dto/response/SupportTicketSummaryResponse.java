package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SupportTicketSummaryResponse {
    private UUID id;
    private String ticketNumber;
    private String subject;
    private String status;
    private String category;
    private String userName;
    private String message;
    private LocalDateTime createdAt;
}
