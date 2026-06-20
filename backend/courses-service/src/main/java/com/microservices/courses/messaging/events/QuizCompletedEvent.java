package com.microservices.courses.messaging.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event received when a student completes a quiz.
 *
 * Exchange : quiz.exchange
 * Routing  : quiz.completed
 * Publisher: Quiz Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCompletedEvent {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Long courseId;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Boolean passed;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private LocalDateTime completedAt;
}
