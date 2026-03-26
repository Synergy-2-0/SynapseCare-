package com.healthcare.prescription.mq;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange("healthcare.exchange");
    }
}
