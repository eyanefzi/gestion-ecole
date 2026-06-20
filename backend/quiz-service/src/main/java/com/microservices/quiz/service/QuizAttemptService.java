package com.microservices.quiz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.quiz.dto.QuizResultDTO;
import com.microservices.quiz.dto.QuizSubmissionDTO;
import com.microservices.quiz.entity.Question;
import com.microservices.quiz.entity.Quiz;
import com.microservices.quiz.entity.QuizAttempt;
import com.microservices.quiz.messaging.QuizEventPublisher;
import com.microservices.quiz.messaging.events.QuizCompletedEvent;
import com.microservices.quiz.repository.QuestionRepository;
import com.microservices.quiz.repository.QuizAttemptRepository;
import com.microservices.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {
    
    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizEventPublisher eventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public QuizResultDTO submitQuiz(QuizSubmissionDTO submission) {
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        List<Question> questions = questionRepository.findByQuizId(submission.getQuizId());
        
        int correctAnswers = 0;
        int totalQuestions = questions.size();
        
        // Calculer le score - les réponses sont maintenant des String
        for (Question question : questions) {
            Object studentAnswerObj = submission.getAnswers().get(question.getId());
            if (studentAnswerObj != null && question.getCorrectAnswer() != null) {
                String studentAnswer = studentAnswerObj.toString().trim();
                String correctAnswer = question.getCorrectAnswer().trim();
                if (studentAnswer.equalsIgnoreCase(correctAnswer)) {
                    correctAnswers++;
                }
            }
        }
        
        int score = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;
        boolean passed = score >= (quiz.getPassingScore() != null ? quiz.getPassingScore() : 60);
        
        // Enregistrer la tentative
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(submission.getQuizId());
        attempt.setStudentId(submission.getStudentId());
        attempt.setStudentName(submission.getStudentName());
        attempt.setScore(score);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers(correctAnswers);
        attempt.setPassed(passed);
        attempt.setCompletedAt(LocalDateTime.now());
        
        try {
            attempt.setAnswers(objectMapper.writeValueAsString(submission.getAnswers()));
        } catch (Exception e) {
            attempt.setAnswers("{}");
        }
        
        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        
        // Publish async event to RabbitMQ → consumed by Courses Service
        try {
            QuizCompletedEvent event = new QuizCompletedEvent(
                    savedAttempt.getId(),
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getCourseId(),
                    submission.getStudentId(),
                    submission.getStudentName(),
                    score,
                    passed,
                    totalQuestions,
                    correctAnswers,
                    savedAttempt.getCompletedAt()
            );
            eventPublisher.publishQuizCompleted(event);
        } catch (Exception e) {
            // RabbitMQ failure must not block quiz submission
            System.err.println("[RabbitMQ] Failed to publish QuizCompletedEvent: " + e.getMessage());
        }

        String message = passed 
                ? "Félicitations! Vous avez réussi le quiz." 
                : "Vous n'avez pas atteint le score minimum. Réessayez!";
        
        return new QuizResultDTO(
                savedAttempt.getId(),
                score,
                totalQuestions,
                correctAnswers,
                passed,
                message
        );
    }
    
    public List<QuizAttempt> getStudentAttempts(Long studentId) {
        return attemptRepository.findByStudentId(studentId);
    }
    
    public List<QuizAttempt> getQuizAttempts(Long quizId) {
        return attemptRepository.findByQuizId(quizId);
    }
    
    public List<QuizAttempt> getStudentQuizAttempts(Long studentId, Long quizId) {
        return attemptRepository.findByStudentIdAndQuizId(studentId, quizId);
    }
}
