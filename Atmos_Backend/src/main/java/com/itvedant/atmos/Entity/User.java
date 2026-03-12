package com.itvedant.atmos.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Column(unique = true, nullable = false)
    private String username;

    @Email
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    private String role;
    
    private String phone;
    private String organizationName;
    private String panGstin;

    @Column(nullable = false)
    private String organizerStatus = "APPROVED"; // Default to APPROVED for ROLE_USER/ROLE_ADMIN

    private String otp;
    private LocalDateTime otpExpiry;
    private Boolean verified = false;
}