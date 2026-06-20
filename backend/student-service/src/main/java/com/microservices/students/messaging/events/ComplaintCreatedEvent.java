package com.microservices.students.messaging.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event received when a complaint is created.
 * 
 * Exchange : complaint.exchange
 * Routing  : complaint.created
 * Publisher: (removed - complaints-service was deleted)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintCreatedEvent {
    private Long complaintId;
    private String title;
    private String category;
    private String priority;
    private Long studentId;
    private String studentName;
    private LocalDateTime createdAt;
}
