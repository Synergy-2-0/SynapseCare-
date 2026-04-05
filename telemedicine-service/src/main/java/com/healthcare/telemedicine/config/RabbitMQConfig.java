package com.healthcare.telemedicine.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SESSION_CREATED_QUEUE = "telemedicine.session.created.queue";
    public static final String SESSION_ENDED_QUEUE = "telemedicine.session.ended.queue";

    @Value("${app.rabbitmq.exchange:healthcare.exchange}")
    private String exchange;

    @Bean
    public Queue sessionCreatedQueue() {
        return new Queue(SESSION_CREATED_QUEUE, true);
    }

    @Bean
    public Queue sessionEndedQueue() {
        return new Queue(SESSION_ENDED_QUEUE, true);
    }

    @Bean
    public TopicExchange telemedicineExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Binding sessionCreatedBinding() {
        return BindingBuilder.bind(sessionCreatedQueue())
                .to(telemedicineExchange())
                .with("telemedicine.session.created");
    }

    @Bean
    public Binding sessionEndedBinding() {
        return BindingBuilder.bind(sessionEndedQueue())
                .to(telemedicineExchange())
                .with("telemedicine.session.ended");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
