package com.healthcare.notification.mq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String HEALTHCARE_EXCHANGE = "healthcare.exchange";
    public static final String APPOINTMENT_EXCHANGE = "appointment.exchange";
    public static final String APPOINTMENT_ROUTING_KEY = "appointment.routing.key";

    // Queues
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String APPOINTMENT_NOTIFICATION_QUEUE = "appointment.notification.queue";
    public static final String PRESCRIPTION_QUEUE = "prescription.queue";
    public static final String TELEMEDICINE_QUEUE = "telemedicine.notification.queue";
    public static final String PAYMENT_FAILED_QUEUE = "notification.payment.failed.queue";

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange(HEALTHCARE_EXCHANGE);
    }

    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(APPOINTMENT_EXCHANGE);
    }

    // Payment success queue
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE);
    }

    // Appointment events queue
    @Bean
    public Queue appointmentNotificationQueue() {
        return new Queue(APPOINTMENT_NOTIFICATION_QUEUE);
    }

    // Prescription events queue
    @Bean
    public Queue prescriptionQueue() {
        return new Queue(PRESCRIPTION_QUEUE);
    }

    // Telemedicine events queue
    @Bean
    public Queue telemedicineQueue() {
        return new Queue(TELEMEDICINE_QUEUE);
    }

    // Payment failed queue
    @Bean
    public Queue paymentFailedQueue() {
        return new Queue(PAYMENT_FAILED_QUEUE);
    }

    // Bindings for payment success
    @Bean
    public Binding notificationBinding(@Qualifier("notificationQueue") Queue notificationQueue, 
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(notificationQueue).to(healthcareExchange).with("payment.success");
    }

    // Bindings for password reset
    @Bean
    public Binding passwordResetBinding(@Qualifier("notificationQueue") Queue notificationQueue, 
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(notificationQueue).to(healthcareExchange).with("notification.auth.password.reset");
    }

    // Bindings for payment failed
    @Bean
    public Binding paymentFailedBinding(@Qualifier("paymentFailedQueue") Queue paymentFailedQueue,
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(paymentFailedQueue).to(healthcareExchange).with("payment.failed");
    }

    // Bindings for appointment events
    @Bean
    public Binding appointmentBinding(@Qualifier("appointmentNotificationQueue") Queue appointmentNotificationQueue, 
            @Qualifier("appointmentExchange") TopicExchange appointmentExchange) {
        return BindingBuilder.bind(appointmentNotificationQueue).to(appointmentExchange).with(APPOINTMENT_ROUTING_KEY);
    }

    // Bindings for prescription events
    @Bean
    public Binding prescriptionBinding(@Qualifier("prescriptionQueue") Queue prescriptionQueue, 
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(prescriptionQueue).to(healthcareExchange).with("prescription.created");
    }

    // Bindings for telemedicine session created
    @Bean
    public Binding telemedicineCreatedBinding(@Qualifier("telemedicineQueue") Queue telemedicineQueue,
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(telemedicineQueue).to(healthcareExchange).with("telemedicine.session.created");
    }

    // Bindings for telemedicine session ended
    @Bean
    public Binding telemedicineEndedBinding(@Qualifier("telemedicineQueue") Queue telemedicineQueue,
            @Qualifier("healthcareExchange") TopicExchange healthcareExchange) {
        return BindingBuilder.bind(telemedicineQueue).to(healthcareExchange).with("telemedicine.session.ended");
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
