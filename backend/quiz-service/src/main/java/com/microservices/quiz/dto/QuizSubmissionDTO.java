package com.microservices.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionDTO {
    private Long quizId;
    private Long studentId;
    private String studentName;
    private Map<Long, Object> answers; // questionId -> selectedAnswer (String)
}
