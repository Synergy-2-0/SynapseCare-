package com.healthcare.notification.mq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String APPOINTMENT_EXCHANGE = "appointment.exchange";
    public static final String APPOINTMENT_ROUTING_KEY = "appointment.routing.key";

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange("healthcare.exchange");
    }

    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(APPOINTMENT_EXCHANGE);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue("notification.queue");
    }

    @Bean
    public Queue appointmentNotificationQueue() {
        return new Queue("appointment.notification.queue");
    }

    @Bean
    public Queue prescriptionQueue() {
        return new Queue("prescription.queue");
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(notificationQueue).to(healthcareExchange).with("payment.success");
    }

    @Bean
    public Binding appointmentBinding(Queue appointmentNotificationQueue, TopicExchange appointmentExchange) {
        return BindingBuilder.bind(appointmentNotificationQueue).to(appointmentExchange).with(APPOINTMENT_ROUTING_KEY);
    }

    @Bean
    public Binding prescriptionBinding(Queue prescriptionQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(prescriptionQueue).to(healthcareExchange).with("prescription.created");
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
