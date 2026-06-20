package com.microservices.courses.client;

import com.microservices.courses.dto.StudentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign Client for Students Service
 * 
 * This client enables Courses Service to communicate with Students Service
 * to retrieve student information for enrolled students.
 * 
 * Scenario: Get all students enrolled in a specific course
 */
@FeignClient(name = "students-service")
public interface StudentsClient {
    
    @GetMapping("/students/{id}")
    StudentDTO getStudentById(@PathVariable("id") Long id);
    
    @GetMapping("/students")
    List<StudentDTO> getAllStudents();
    
    @GetMapping("/students/by-course/{courseId}")
    List<StudentDTO> getStudentsByCourseId(@PathVariable("courseId") Long courseId);
}
