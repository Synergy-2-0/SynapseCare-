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
    public static final String AUTH_VALIDATION_QUEUE = "auth.validation.queue";
    public static final String USER_REGISTERED_QUEUE = "user.registered.queue";

    // Exchange names
    public static final String AUTH_EXCHANGE = "auth.exchange";
    public static final String USER_EXCHANGE = "user.exchange";

    // Routing keys
    public static final String AUTH_VALIDATION_ROUTING_KEY = "auth.validate";
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered.doctor";

    // Queues
    @Bean
    public Queue authValidationQueue() {
        return new Queue(AUTH_VALIDATION_QUEUE, true);
    }

    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    // Exchanges
    @Bean
    public DirectExchange authExchange() {
        return new DirectExchange(AUTH_EXCHANGE);
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
