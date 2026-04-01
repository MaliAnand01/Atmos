package com.itvedant.atmos.DTO;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String phone;
    private String organizationName;
    private String panGstin;
    private String organizerStatus;
    private Boolean verified;
    private String token;
}
