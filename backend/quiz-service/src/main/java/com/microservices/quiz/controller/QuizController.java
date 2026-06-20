package com.microservices.quiz.controller;

import com.microservices.quiz.entity.Quiz;
import com.microservices.quiz.entity.Question;
import com.microservices.quiz.repository.QuizRepository;
import com.microservices.quiz.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private com.microservices.quiz.service.QuizAttemptService quizAttemptService;

    @GetMapping
    public List<Quiz> getAllQuizzes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        List<Quiz> quizzes;
        if (search != null || difficulty != null) {
            String s = (search != null && !search.isBlank()) ? search : null;
            String d = (difficulty != null && !difficulty.isBlank()) ? difficulty : null;
            quizzes = quizRepository.searchQuizzes(s, d);
        } else {
            quizzes = quizRepository.findAll();
        }
        if (sortBy != null && !sortBy.isEmpty()) {
            java.util.Comparator<Quiz> cmp = switch (sortBy) {
                case "difficulty" -> java.util.Comparator.comparing(q -> q.getDifficulty() != null ? q.getDifficulty() : "");
                case "timeLimit" -> java.util.Comparator.comparingInt(q -> q.getTimeLimit() != null ? q.getTimeLimit() : 0);
                case "passingScore" -> java.util.Comparator.comparingInt(q -> q.getPassingScore() != null ? q.getPassingScore() : 0);
                default -> java.util.Comparator.comparing(q -> q.getTitle() != null ? q.getTitle().toLowerCase() : "");
            };
            if ("desc".equalsIgnoreCase(sortDir)) cmp = cmp.reversed();
            quizzes = quizzes.stream().sorted(cmp).collect(java.util.stream.Collectors.toList());
        }
        return quizzes;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("quiz", quiz);
                    response.put("questions", questionRepository.findByQuizId(id));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @GetMapping("/{quizId}/questions")
    public List<Question> getQuizQuestions(@PathVariable Long quizId) {
        return questionRepository.findByQuizId(quizId);
    }

    @PostMapping("/{quizId}/questions")
    public Question addQuestion(@PathVariable Long quizId, @RequestBody Question question) {
        question.setQuizId(quizId);
        return questionRepository.save(question);
    }
    
    @PutMapping("/questions/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        return questionRepository.findById(id)
                .map(question -> {
                    question.setQuestionText(questionDetails.getQuestionText());
                    question.setOptions(questionDetails.getOptions());
                    question.setCorrectAnswer(questionDetails.getCorrectAnswer());
                    return ResponseEntity.ok(questionRepository.save(question));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        return questionRepository.findById(id)
                .map(question -> {
                    questionRepository.delete(question);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizDetails) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quiz.setTitle(quizDetails.getTitle());
                    quiz.setDescription(quizDetails.getDescription());
                    quiz.setCourseId(quizDetails.getCourseId());
                    quiz.setDifficulty(quizDetails.getDifficulty());
                    quiz.setTimeLimit(quizDetails.getTimeLimit());
                    quiz.setPassingScore(quizDetails.getPassingScore());
                    return ResponseEntity.ok(quizRepository.save(quiz));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    questionRepository.deleteAll(questionRepository.findByQuizId(id));
                    quizRepository.delete(quiz);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Endpoints pour passer les quiz
    @PostMapping("/submit")
    public ResponseEntity<com.microservices.quiz.dto.QuizResultDTO> submitQuiz(
            @RequestBody com.microservices.quiz.dto.QuizSubmissionDTO submission) {
        try {
            com.microservices.quiz.dto.QuizResultDTO result = quizAttemptService.submitQuiz(submission);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/attempts/student/{studentId}")
    public List<com.microservices.quiz.entity.QuizAttempt> getStudentAttempts(@PathVariable Long studentId) {
        return quizAttemptService.getStudentAttempts(studentId);
    }
    
    @GetMapping("/{quizId}/attempts")
    public List<com.microservices.quiz.entity.QuizAttempt> getQuizAttempts(@PathVariable Long quizId) {
        return quizAttemptService.getQuizAttempts(quizId);
    }
    
    @GetMapping("/{quizId}/attempts/student/{studentId}")
    public List<com.microservices.quiz.entity.QuizAttempt> getStudentQuizAttempts(
            @PathVariable Long quizId,
            @PathVariable Long studentId) {
        return quizAttemptService.getStudentQuizAttempts(studentId, quizId);
    }
}
