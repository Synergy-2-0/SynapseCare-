package com.healthcare.telemedicine.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SESSION_CREATED_QUEUE = "telemedicine.session.created.queue";
    public static final String SESSION_ENDED_QUEUE = "telemedicine.session.ended.queue";
    public static final String APPOINTMENT_EVENT_QUEUE = "telemedicine.appointment.event.queue";

    @Value("${app.rabbitmq.appointment-exchange:appointment.exchange}")
    private String appointmentExchange;

    @Value("${app.rabbitmq.appointment-routing-key:appointment.routing.key}")
    private String appointmentRoutingKey;

    @Bean
    public Queue sessionCreatedQueue() {
        return new Queue(SESSION_CREATED_QUEUE, true);
    }

    @Bean
    public Queue sessionEndedQueue() {
        return new Queue(SESSION_ENDED_QUEUE, true);
    }

    @Bean
    public Queue appointmentEventQueue() {
        return new Queue(APPOINTMENT_EVENT_QUEUE, true);
    }

    @Bean
    public TopicExchange telemedicineExchange() {
        return new TopicExchange("healthcare.exchange");
    }

    @Bean
    public TopicExchange appointmentTopicExchange() {
        return new TopicExchange(appointmentExchange);
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
    public Binding appointmentEventBinding() {
        return BindingBuilder.bind(appointmentEventQueue())
                .to(appointmentTopicExchange())
                .with(appointmentRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }


}
