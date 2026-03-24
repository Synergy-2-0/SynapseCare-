package com.synapscare.doctorservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Queue names
    public static final String AUTH_VALIDATION_QUEUE = "auth.validation.queue";
    public static final String AUTH_VALIDATION_REPLY_QUEUE = "auth.validation.reply.queue";
    public static final String USER_REGISTERED_QUEUE = "user.registered.queue";
    public static final String DOCTOR_VERIFIED_QUEUE = "doctor.verified.queue";

    // Exchange names
    public static final String AUTH_EXCHANGE = "auth.exchange";
    public static final String DOCTOR_EXCHANGE = "doctor.exchange";
    public static final String USER_EXCHANGE = "user.exchange";

    // Routing keys
    public static final String AUTH_VALIDATION_ROUTING_KEY = "auth.validate";
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered.doctor";
    public static final String DOCTOR_VERIFIED_ROUTING_KEY = "doctor.verified";

    // Auth validation queues
    @Bean
    public Queue authValidationQueue() {
        return new Queue(AUTH_VALIDATION_QUEUE, true);
    }

    @Bean
    public Queue authValidationReplyQueue() {
        return new Queue(AUTH_VALIDATION_REPLY_QUEUE, true);
    }

    // User registered queue (for doctor-service to listen)
    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    // Doctor verified queue (for notifications)
    @Bean
    public Queue doctorVerifiedQueue() {
        return new Queue(DOCTOR_VERIFIED_QUEUE, true);
    }

    // Exchanges
    @Bean
    public DirectExchange authExchange() {
        return new DirectExchange(AUTH_EXCHANGE);
    }

    @Bean
    public DirectExchange doctorExchange() {
        return new DirectExchange(DOCTOR_EXCHANGE);
    }

    @Bean
    public DirectExchange userExchange() {
        return new DirectExchange(USER_EXCHANGE);
    }

    // Bindings
    @Bean
    public Binding authValidationBinding(Queue authValidationQueue, DirectExchange authExchange) {
        return BindingBuilder.bind(authValidationQueue)
                .to(authExchange)
                .with(AUTH_VALIDATION_ROUTING_KEY);
    }

    @Bean
    public Binding userRegisteredBinding(Queue userRegisteredQueue, DirectExchange userExchange) {
        return BindingBuilder.bind(userRegisteredQueue)
                .to(userExchange)
                .with(USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding doctorVerifiedBinding(Queue doctorVerifiedQueue, DirectExchange doctorExchange) {
        return BindingBuilder.bind(doctorVerifiedQueue)
                .to(doctorExchange)
                .with(DOCTOR_VERIFIED_ROUTING_KEY);
    }

    // Message converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate with message converter
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
