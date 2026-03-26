package com.healthcare.notification.mq;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange("healthcare.exchange");
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue("notification.queue");
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
    public Binding prescriptionBinding(Queue prescriptionQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(prescriptionQueue).to(healthcareExchange).with("prescription.created");
    }
}
