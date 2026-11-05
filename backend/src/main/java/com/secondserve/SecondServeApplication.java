package com.secondserve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SecondServe – Surplus Food Rescue Coordination System
 * College Project Spring Boot Entry Application
 */
@SpringBootApplication
public class SecondServeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecondServeApplication.class, args);
        System.out.println("SecondServe Spring Boot API Server running on port 8080");
    }
}
