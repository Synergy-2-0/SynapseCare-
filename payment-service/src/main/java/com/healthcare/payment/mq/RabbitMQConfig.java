package com.healthcare.payment.mq;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RabbitMQConfig {

    public static final String EXCHANGE = "healthcare.exchange";
    public static final String PAYMENT_QUEUE = "payment.queue";
    public static final String PAYMENT_SUCCESS_ROUTING_KEY = "payment.success";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable(PAYMENT_QUEUE).build();
    }

    @Bean
    public Binding paymentSuccessBinding(Queue paymentQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(paymentQueue)
                .to(healthcareExchange)
                .with(PAYMENT_SUCCESS_ROUTING_KEY);
    }

    @Bean
    public Binding paymentFailedBinding(Queue paymentQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(paymentQueue)
                .to(healthcareExchange)
                .with(PAYMENT_FAILED_ROUTING_KEY);
    }
}
