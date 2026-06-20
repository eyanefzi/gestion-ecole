package com.microservices.quiz.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long quizId;
    
    @Column(length = 500)
    private String questionText;
    
    @Column(length = 1000)
    private String options; // Format: "Option A,Option B,Option C,Option D"
    
    @Column(length = 500)
    private String correctAnswer; // La réponse correcte exacte
    
    private Integer points;
}
