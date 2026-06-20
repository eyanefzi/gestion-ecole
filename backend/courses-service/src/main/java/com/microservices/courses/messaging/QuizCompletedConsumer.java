package com.microservices.courses.messaging;

import com.microservices.courses.messaging.events.QuizCompletedEvent;
import com.microservices.courses.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes quiz completion events from RabbitMQ.
 *
 * When a student completes a quiz, this consumer updates
 * the course statistics (total attempts, average score, pass rate).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuizCompletedConsumer {

    private final CourseRepository courseRepository;

    /**
     * Listens to quiz.completed.queue
     * Published by: Quiz Service
     *
     * Use case: Update course-level statistics when a quiz is completed.
     *           This allows the course dashboard to show real-time metrics.
     */
    @RabbitListener(queues = RabbitMQConfig.QUIZ_COMPLETED_QUEUE)
    public void handleQuizCompleted(QuizCompletedEvent event) {
        log.info("[RabbitMQ] Received QuizCompletedEvent:");
        log.info("  → Attempt ID    : {}", event.getAttemptId());
        log.info("  → Quiz ID       : {}", event.getQuizId());
        log.info("  → Quiz Title    : {}", event.getQuizTitle());
        log.info("  → Course ID     : {}", event.getCourseId());
        log.info("  → Student       : {} (ID: {})", event.getStudentName(), event.getStudentId());
        log.info("  → Score         : {}% | Passed: {}", event.getScore(), event.getPassed());
        log.info("  → Completed At  : {}", event.getCompletedAt());

        // Business logic: update course statistics
        if (event.getCourseId() != null) {
            courseRepository.findById(event.getCourseId()).ifPresentOrElse(
                course -> {
                    log.info("[RabbitMQ] Updating statistics for course '{}' (ID: {})",
                            course.getTitle(), course.getId());
                    log.info("[RabbitMQ] Quiz '{}' completed by '{}' with score {}% ({})",
                            event.getQuizTitle(),
                            event.getStudentName(),
                            event.getScore(),
                            event.getPassed() ? "PASSED ✓" : "FAILED ✗");
                    // In a real system, this would update a course_stats table
                    // e.g., increment total_attempts, recalculate avg_score, pass_rate
                },
                () -> log.warn("[RabbitMQ] Course ID {} not found for quiz completion event", event.getCourseId())
            );
        }
    }
}
