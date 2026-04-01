package com.healthcare.appointment.mq;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration("mqRabbitMQConfig")
public class RabbitMQConfig {

    public static final String EXCHANGE = "healthcare.exchange";
    public static final String APPOINTMENT_CONFIRM_QUEUE = "appointment.confirm.queue";
    public static final String APPOINTMENT_COMPLETE_QUEUE = "appointment.complete.queue";
    public static final String APPOINTMENT_FAILED_QUEUE = "appointment.failed.queue";
    public static final String PAYMENT_SUCCESS_ROUTING_KEY = "payment.success";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";
    public static final String PRESCRIPTION_CREATED_ROUTING_KEY = "prescription.created";

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue appointmentConfirmQueue() {
        return QueueBuilder.durable(APPOINTMENT_CONFIRM_QUEUE).build();
    }

    @Bean
    public Queue appointmentCompleteQueue() {
        return QueueBuilder.durable(APPOINTMENT_COMPLETE_QUEUE).build();
    }

    @Bean
    public Queue appointmentFailedQueue() {
        return QueueBuilder.durable(APPOINTMENT_FAILED_QUEUE).build();
    }

    @Bean
    public Binding appointmentConfirmBinding() {
        return BindingBuilder.bind(appointmentConfirmQueue())
                .to(healthcareExchange())
                .with(PAYMENT_SUCCESS_ROUTING_KEY);
    }

    @Bean
    public Binding appointmentFailedBinding() {
        return BindingBuilder.bind(appointmentFailedQueue())
                .to(healthcareExchange())
                .with(PAYMENT_FAILED_ROUTING_KEY);
    }

    @Bean
    public Binding appointmentCompleteBinding() {
        return BindingBuilder.bind(appointmentCompleteQueue())
                .to(healthcareExchange())
                .with(PRESCRIPTION_CREATED_ROUTING_KEY);
    }
}
