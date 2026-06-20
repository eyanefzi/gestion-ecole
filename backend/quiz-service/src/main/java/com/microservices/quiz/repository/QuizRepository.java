package com.microservices.quiz.repository;

import com.microservices.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseId(Long courseId);

    List<Quiz> findByDifficulty(String difficulty);

    List<Quiz> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT q FROM Quiz q WHERE " +
           "(:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty)")
    List<Quiz> searchQuizzes(@Param("search") String search, @Param("difficulty") String difficulty);
}
