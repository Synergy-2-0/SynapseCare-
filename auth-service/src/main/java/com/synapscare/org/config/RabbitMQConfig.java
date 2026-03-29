package com.synapscare.org.config;

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
    public static final String USER_REGISTERED_QUEUE = "user.registered.queue";
    public static final String USER_DOCTOR_VERIFIED_QUEUE = "user.doctor.verified.queue";

    // Exchange names
    public static final String USER_EXCHANGE = "user.exchange";

    // Routing keys
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered.doctor";
    public static final String USER_DOCTOR_VERIFIED_ROUTING_KEY = "user.doctor.verified";

    // Queues
    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    @Bean
    public Queue userDoctorVerifiedQueue() {
        return new Queue(USER_DOCTOR_VERIFIED_QUEUE, true);
    }

    // Exchanges
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
    public Binding userDoctorVerifiedBinding(Queue userDoctorVerifiedQueue, DirectExchange userExchange) {
        return BindingBuilder.bind(userDoctorVerifiedQueue)
                .to(userExchange)
                .with(USER_DOCTOR_VERIFIED_ROUTING_KEY);
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
