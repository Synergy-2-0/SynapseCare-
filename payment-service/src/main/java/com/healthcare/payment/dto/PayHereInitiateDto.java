package com.healthcare.payment.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayHereInitiateDto {
    // Fields to be submitted to PayHere sandbox checkout page
    private String merchant_id;
    private String return_url;
    private String cancel_url;
    private String notify_url;
    private String order_id;
    private String items;
    private String currency;
    private BigDecimal amount;
    private String first_name;
    private String last_name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String hash;
    private String sandbox;
}
