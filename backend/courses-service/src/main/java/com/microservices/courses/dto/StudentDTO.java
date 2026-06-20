package com.microservices.courses.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Student DTO for Feign Client communication
 * Mirrors the Student entity from Students Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String studentCode;
    private String major;
    private Integer year;
}
