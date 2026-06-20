package com.microservices.students.messaging;

import com.microservices.students.messaging.events.StudentEnrolledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes student-related events to RabbitMQ.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publishes a StudentEnrolledEvent when a student enrolls in a course.
     * Consumed by: Clubs Service
     */
    public void publishStudentEnrolled(StudentEnrolledEvent event) {
        log.info("[RabbitMQ] Publishing StudentEnrolledEvent: studentId={}, courseId={}",
                event.getStudentId(), event.getCourseId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.STUDENT_EXCHANGE,
                RabbitMQConfig.STUDENT_ENROLLED_KEY,
                event
        );
        log.info("[RabbitMQ] StudentEnrolledEvent published successfully");
    }
}
