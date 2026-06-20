package com.microservices.students.messaging;

import com.microservices.students.messaging.events.ComplaintCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes complaint events from RabbitMQ.
 * 
 * When a complaint is created in Complaints Service,
 * this consumer logs/processes the notification for the student.
 */
@Slf4j
@Component
public class ComplaintEventConsumer {

    /**
     * Listens to complaint.student.queue
     * Published by: Complaints Service
     * 
     * Use case: Notify the student that their complaint has been received
     *           and is being processed.
     */
    @RabbitListener(queues = RabbitMQConfig.COMPLAINT_STUDENT_QUEUE)
    public void handleComplaintCreated(ComplaintCreatedEvent event) {
        log.info("[RabbitMQ] Received ComplaintCreatedEvent:");
        log.info("  → Complaint ID  : {}", event.getComplaintId());
        log.info("  → Title         : {}", event.getTitle());
        log.info("  → Priority      : {}", event.getPriority());
        log.info("  → Student ID    : {}", event.getStudentId());
        log.info("  → Student Name  : {}", event.getStudentName());
        log.info("  → Created At    : {}", event.getCreatedAt());

        // Business logic: notify the student
        // In a real system, this would send an email/push notification
        log.info("[RabbitMQ] Notification sent to student '{}': Your complaint '{}' (priority: {}) has been received.",
                event.getStudentName(), event.getTitle(), event.getPriority());
    }
}
