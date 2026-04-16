package com.healthcare.notification.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDTO {
    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("emailEnabled")
    private Boolean emailEnabled;
    @JsonProperty("emailAppointmentConfirmation")
    private Boolean emailAppointmentConfirmation;
    @JsonProperty("emailAppointmentReminder")
    private Boolean emailAppointmentReminder;
    @JsonProperty("emailPaymentConfirmation")
    private Boolean emailPaymentConfirmation;
    @JsonProperty("emailPrescriptionReady")
    private Boolean emailPrescriptionReady;
    @JsonProperty("emailTelemedicineSession")
    private Boolean emailTelemedicineSession;

    @JsonProperty("smsEnabled")
    private Boolean smsEnabled;
    @JsonProperty("smsAppointmentConfirmation")
    private Boolean smsAppointmentConfirmation;
    @JsonProperty("smsAppointmentReminder")
    private Boolean smsAppointmentReminder;
    @JsonProperty("smsTelemedicineSession")
    private Boolean smsTelemedicineSession;

    @JsonProperty("whatsappEnabled")
    private Boolean whatsappEnabled;
    @JsonProperty("whatsappAppointmentConfirmation")
    private Boolean whatsappAppointmentConfirmation;
    @JsonProperty("whatsappAppointmentReminder")
    private Boolean whatsappAppointmentReminder;
    @JsonProperty("whatsappTelemedicineSession")
    private Boolean whatsappTelemedicineSession;
    @JsonProperty("whatsappPrescriptionReady")
    private Boolean whatsappPrescriptionReady;

    @JsonProperty("preferredAppointmentChannel")
    private String preferredAppointmentChannel;

    @JsonProperty("inAppEnabled")
    private Boolean inAppEnabled;
}
