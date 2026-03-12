package com.itvedant.atmos.DTO;

import lombok.Data;

@Data
public class UserRequestDTO {
    private String username;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String organizationName;
    private String panGstin;
}
