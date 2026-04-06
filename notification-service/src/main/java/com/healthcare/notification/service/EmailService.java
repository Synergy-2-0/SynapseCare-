package com.healthcare.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service for sending email notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@synapcare.com}")
    private String fromEmail;

    @Value("${app.notification.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.notification.email.mock:true}")
    private boolean mockMode;

    /**
     * Send a simple text email
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would have sent to: {}", to);
            return;
        }

        if (mockMode) {
            logMockEmail(to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("SynapsCare <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send an HTML email
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would have sent to: {}", to);
            return;
        }

        if (mockMode) {
            logMockEmail(to, subject, htmlBody);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("SynapsCare <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String to, String patientName, String token) {
        String subject = "SynapseCare - Reset Your Password";
        String body = buildPasswordResetHtml(patientName, token);
        sendHtmlEmail(to, subject, body);
    }

    /**
     * Send appointment confirmation email
     */
    public void sendAppointmentConfirmationEmail(String to, String patientName, String doctorName, 
            String appointmentDate, String appointmentTime, Long appointmentId) {
        String subject = "SynapseCare - Appointment Confirmed #" + appointmentId;
        String body = buildAppointmentConfirmationHtml(patientName, doctorName, appointmentDate, 
                appointmentTime, appointmentId);
        sendHtmlEmail(to, subject, body);
    }

    /**
     * Send payment success email
     */
    public void sendPaymentSuccessEmail(String to, String patientName, Long appointmentId, 
            String amount, String paymentId) {
        String subject = "SynapseCare - Payment Successful";
        String body = buildPaymentSuccessHtml(patientName, appointmentId, amount, paymentId);
        sendHtmlEmail(to, subject, body);
    }

    /**
     * Send prescription ready email
     */
    public void sendPrescriptionReadyEmail(String to, String patientName, String doctorName, 
            Long appointmentId) {
        String subject = "SynapseCare - Your Prescription is Ready";
        String body = buildPrescriptionReadyHtml(patientName, doctorName, appointmentId);
        sendHtmlEmail(to, subject, body);
    }

    /**
     * Send telemedicine session reminder email
     */
    public void sendTelemedicineReminderEmail(String to, String name, String sessionUrl, 
            String scheduledTime, Long appointmentId) {
        String subject = "SynapseCare - Telemedicine Session Starting Soon";
        String body = buildTelemedicineReminderHtml(name, sessionUrl, scheduledTime, appointmentId);
        sendHtmlEmail(to, subject, body);
    }

    private void logMockEmail(String to, String subject, String body) {
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("📧 [MOCK EMAIL]");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body.length() > 500 ? body.substring(0, 500) + "..." : body);
        log.info("═══════════════════════════════════════════════════════════════");
    }

    private String buildPasswordResetHtml(String patientName, String token) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1e3a8a 0%%, #3b82f6 100%%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #ffffff; padding: 35px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
                    .btn-container { text-align: center; margin: 30px 0; }
                    .btn { 
                        display: inline-block; 
                        background: #1e3a8a; 
                        color: #ffffff !important; 
                        padding: 14px 35px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        font-size: 16px;
                    }
                    .info { font-size: 14px; color: #6b7280; margin-top: 25px; line-height: 1.4; }
                    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 25px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🔒 Password Reset Request</h2>
                    </div>
                    <div class="content">
                        <p>Hello %s,</p>
                        <p>We received a request to reset your password for your <strong>SynapseCare</strong> account.</p>
                        <p>Click the secure button below to set a new password. This link will expire in 24 hours.</p>
                        
                        <div class="btn-container">
                            <a href="http://localhost:3000/reset-password?token=%s" class="btn">Reset Password</a>
                        </div>
                        
                        <p>If you didn't request this, you can safely ignore this email. Your current password will remain unchanged.</p>
                        
                        <div class="info">
                            <strong>Security Tip:</strong> Never share this link with anyone. Our support team will never ask for your password or reset link.
                        </div>
                        
                        <div class="footer">
                            <p>SynapseCare - Clinical Excellence. Professional Care.</p>
                            <p>Administered by Google DeepMind Advanced Agentic Coding Team</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(patientName, token);
    }

    private String buildAppointmentConfirmationHtml(String patientName, String doctorName, 
            String appointmentDate, String appointmentTime, Long appointmentId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Appointment Confirmed</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Your appointment has been successfully confirmed! Here are the details:</p>
                        <div class="details">
                            <div class="detail-row"><strong>Appointment ID:</strong> #%d</div>
                            <div class="detail-row"><strong>Doctor:</strong> Dr. %s</div>
                            <div class="detail-row"><strong>Date:</strong> %s</div>
                            <div class="detail-row"><strong>Time:</strong> %s</div>
                        </div>
                        <p>Please arrive 10 minutes before your scheduled time.</p>
                        <a href="https://synapcare.com/appointments/%d" class="btn">View Appointment</a>
                        <div class="footer">
                            <p>SynapseCare - Your Health, Our Priority</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(patientName, appointmentId, doctorName, appointmentDate, appointmentTime, appointmentId);
    }

    private String buildPaymentSuccessHtml(String patientName, Long appointmentId, String amount, String paymentId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 36px; color: #11998e; text-align: center; margin: 20px 0; }
                    .details { background: white; padding: 20px; border-radius: 8px; }
                    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💳 Payment Successful</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Your payment has been processed successfully.</p>
                        <div class="amount">%s</div>
                        <div class="details">
                            <p><strong>Payment ID:</strong> %s</p>
                            <p><strong>Appointment:</strong> #%d</p>
                        </div>
                        <p>Thank you for choosing SynapseCare!</p>
                        <div class="footer">
                            <p>SynapseCare - Your Health, Our Priority</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(patientName, amount, paymentId, appointmentId);
    }

    private String buildPrescriptionReadyHtml(String patientName, String doctorName, Long appointmentId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Prescription Ready</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Dr. %s has issued a new prescription for your consultation (Appointment #%d).</p>
                        <p>You can view and download your prescription from your patient dashboard.</p>
                        <a href="https://synapcare.com/prescriptions" class="btn">View Prescription</a>
                        <div class="footer">
                            <p>SynapseCare - Your Health, Our Priority</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(patientName, doctorName, appointmentId);
    }

    private String buildTelemedicineReminderHtml(String name, String sessionUrl, String scheduledTime, Long appointmentId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00c6ff 0%%, #0072ff 100%%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .btn { display: inline-block; background: #0072ff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-size: 18px; }
                    .time { font-size: 24px; color: #0072ff; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎥 Telemedicine Session</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Your telemedicine consultation is about to begin!</p>
                        <div class="time">Scheduled: %s</div>
                        <p>Click the button below to join the video session:</p>
                        <center><a href="%s" class="btn">Join Session</a></center>
                        <p style="margin-top: 20px; font-size: 14px;">
                            <strong>Tips for your session:</strong><br>
                            • Ensure you have a stable internet connection<br>
                            • Use a well-lit, quiet room<br>
                            • Have your medical documents ready
                        </p>
                        <div class="footer">
                            <p>Appointment #%d | SynapseCare</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, scheduledTime, sessionUrl, appointmentId);
    }
}
