package com.microservices.courses.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration for Courses Service
 *
 * [CONSUMER] quiz.exchange
 *   └── quiz.completed.queue  (routing key: quiz.completed)
 *       → Published by: Quiz Service (when a student completes a quiz)
 *       → Action: update course statistics (attempts, avg score, pass rate)
 */
@Configuration
public class RabbitMQConfig {

    public static final String QUIZ_EXCHANGE        = "quiz.exchange";
    public static final String QUIZ_COMPLETED_KEY   = "quiz.completed";
    public static final String QUIZ_COMPLETED_QUEUE = "quiz.completed.queue";

    @Bean
    public TopicExchange quizExchange() {
        return new TopicExchange(QUIZ_EXCHANGE, true, false);
    }

    @Bean
    public Queue quizCompletedQueue() {
        return QueueBuilder.durable(QUIZ_COMPLETED_QUEUE).build();
    }

    @Bean
    public Binding quizCompletedBinding() {
        return BindingBuilder
                .bind(quizCompletedQueue())
                .to(quizExchange())
                .with(QUIZ_COMPLETED_KEY);
    }

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
