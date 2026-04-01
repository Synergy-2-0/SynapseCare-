package com.healthcare.appointment.config;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String APPOINTMENT_CONFIRM_QUEUE = "appointment.confirm.queue";
    public static final String APPOINTMENT_FAILED_QUEUE = "appointment.failed.queue";
    public static final String APPOINTMENT_COMPLETE_QUEUE = "appointment.complete.queue";
    public static final String NOTIFICATION_QUEUE = "appointment.notification.queue";

    @Value("${app.rabbitmq.queue}")
    private String queue;

    @Value("${app.rabbitmq.exchange:healthcare.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    @Bean
    public Queue mainQueue() {
        return new Queue(queue);
    }

    @Bean
    public Queue confirmQueue() {
        return new Queue(APPOINTMENT_CONFIRM_QUEUE);
    }

    @Bean
    public Queue failedQueue() {
        return new Queue(APPOINTMENT_FAILED_QUEUE);
    }

    @Bean
    public Queue completeQueue() {
        return new Queue(APPOINTMENT_COMPLETE_QUEUE);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Binding mainBinding() {
        return BindingBuilder.bind(mainQueue()).to(exchange()).with(routingKey);
    }

    @Bean
    public Binding confirmBinding() {
        return BindingBuilder.bind(confirmQueue())
                .to(exchange())
                .with("payment.success");
    }

    @Bean
    public Binding failedBinding() {
        return BindingBuilder.bind(failedQueue())
                .to(exchange())
                .with("payment.failed");
    }

    @Bean
    public Binding completeBinding() {
        return BindingBuilder.bind(completeQueue())
                .to(exchange())
                .with("prescription.created");
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}
