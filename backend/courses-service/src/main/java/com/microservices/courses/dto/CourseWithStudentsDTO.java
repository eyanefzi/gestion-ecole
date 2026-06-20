package com.microservices.courses.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO representing a Course with its enrolled Students
 * Used for Feign Client communication scenario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseWithStudentsDTO {
    private Long id;
    private String title;
    private String description;
    private String instructor;
    private String level;
    private Integer duration;
    private List<StudentDTO> enrolledStudents;
    private Integer totalEnrollments;
}
