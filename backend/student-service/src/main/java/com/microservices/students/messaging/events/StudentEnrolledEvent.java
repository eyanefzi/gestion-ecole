package com.microservices.students.messaging.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event published when a student enrolls in a course.
 * 
 * Exchange : student.exchange
 * Routing  : student.enrolled
 * Consumers: (none currently)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentEnrolledEvent {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseName;
    private LocalDateTime enrolledAt;
}
