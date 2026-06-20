package com.microservices.students.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration for Student Service
 *
 * Exchanges & Queues:
 *
 * [PUBLISHER] student.exchange
 *   └── student.enrolled.queue  (routing key: student.enrolled)
 *       → Consumed by: Clubs Service (notify new enrollment)
 *
 * [CONSUMER] complaint.exchange
 *   └── complaint.student.queue (routing key: complaint.created)
 *       → Published by: Complaints Service (notify student of new complaint)
 */
@Configuration
public class RabbitMQConfig {

    // ── Exchange names ────────────────────────────────────────────────────────
    public static final String STUDENT_EXCHANGE       = "student.exchange";
    public static final String COMPLAINT_EXCHANGE     = "complaint.exchange";

    // ── Routing keys ──────────────────────────────────────────────────────────
    public static final String STUDENT_ENROLLED_KEY   = "student.enrolled";
    public static final String COMPLAINT_CREATED_KEY  = "complaint.created";

    // ── Queue names ───────────────────────────────────────────────────────────
    public static final String STUDENT_ENROLLED_QUEUE = "student.enrolled.queue";
    public static final String COMPLAINT_STUDENT_QUEUE = "complaint.student.queue";

    // ── Exchanges ─────────────────────────────────────────────────────────────

    @Bean
    public TopicExchange studentExchange() {
        return new TopicExchange(STUDENT_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange complaintExchange() {
        return new TopicExchange(COMPLAINT_EXCHANGE, true, false);
    }

    // ── Queues ────────────────────────────────────────────────────────────────

    @Bean
    public Queue studentEnrolledQueue() {
        return QueueBuilder.durable(STUDENT_ENROLLED_QUEUE).build();
    }

    @Bean
    public Queue complaintStudentQueue() {
        return QueueBuilder.durable(COMPLAINT_STUDENT_QUEUE).build();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────

    @Bean
    public Binding studentEnrolledBinding() {
        return BindingBuilder
                .bind(studentEnrolledQueue())
                .to(studentExchange())
                .with(STUDENT_ENROLLED_KEY);
    }

    @Bean
    public Binding complaintStudentBinding() {
        return BindingBuilder
                .bind(complaintStudentQueue())
                .to(complaintExchange())
                .with(COMPLAINT_CREATED_KEY);
    }

    // ── Message Converter (JSON) ──────────────────────────────────────────────

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
