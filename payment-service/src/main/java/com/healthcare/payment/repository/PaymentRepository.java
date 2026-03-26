package com.healthcare.payment.repository;

import com.healthcare.payment.entity.Payment;
import com.healthcare.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentId(String paymentId);
    Optional<Payment> findByMerchantOrderId(String merchantOrderId);
    Optional<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByPatientId(Long patientId);
    List<Payment> findByPatientIdAndStatus(Long patientId, PaymentStatus status);
    List<Payment> findByStatus(PaymentStatus status);
}
