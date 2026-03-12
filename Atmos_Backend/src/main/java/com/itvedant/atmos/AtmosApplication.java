package com.itvedant.atmos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AtmosApplication {

    public static void main(String[] args) {
        SpringApplication.run(AtmosApplication.class, args);
    }
}
