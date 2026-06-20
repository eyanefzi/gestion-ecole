package com.microservices.quiz.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long quizId;
    
    private Long studentId;
    
    private String studentName;
    
    private Integer score;
    
    private Integer totalQuestions;
    
    private Integer correctAnswers;
    
    private Boolean passed;
    
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    @Column(length = 2000)
    private String answers; // JSON string: {"1": 2, "2": 1, ...}
    
    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
}
