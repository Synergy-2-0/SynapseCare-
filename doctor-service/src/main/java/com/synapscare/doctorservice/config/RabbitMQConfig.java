package com.synapscare.doctorservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class RabbitMQConfig {

    // Queue names
    public static final String USER_REGISTERED_QUEUE = "user.registered.queue";
    public static final String DOCTOR_VERIFIED_QUEUE = "doctor.verified.queue";

    // Exchange names
    public static final String DOCTOR_EXCHANGE = "doctor.exchange";
    public static final String USER_EXCHANGE = "user.exchange";

    // Routing keys
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered.doctor";
    public static final String DOCTOR_VERIFIED_ROUTING_KEY = "doctor.verified";



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
    public DirectExchange doctorExchange() {
        return new DirectExchange(DOCTOR_EXCHANGE);
    }

    @Bean
    public DirectExchange userExchange() {
        return new DirectExchange(USER_EXCHANGE);
    }

    // Bindings
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
    public MessageConverter jsonMessageConverter(JsonMapper jsonMapper) {
        return new JacksonJsonMessageConverter(jsonMapper);
    }

    // RabbitTemplate with message converter
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
