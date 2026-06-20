package com.microservices.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {
    private Long attemptId;
    private Integer score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Boolean passed;
    private String message;
}
