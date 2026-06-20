package com.microservices.quiz.messaging;

import com.microservices.quiz.messaging.events.QuizCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes quiz-related events to RabbitMQ.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuizEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publishes a QuizCompletedEvent when a student finishes a quiz.
     * Consumed by: Courses Service (to update course statistics)
     */
    public void publishQuizCompleted(QuizCompletedEvent event) {
        log.info("[RabbitMQ] Publishing QuizCompletedEvent: quizId={}, studentId={}, score={}",
                event.getQuizId(), event.getStudentId(), event.getScore());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.QUIZ_EXCHANGE,
                RabbitMQConfig.QUIZ_COMPLETED_KEY,
                event
        );
        log.info("[RabbitMQ] QuizCompletedEvent published successfully");
    }
}
