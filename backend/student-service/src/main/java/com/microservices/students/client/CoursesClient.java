package com.microservices.students.client;

import com.microservices.students.dto.CourseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "courses-service")
public interface CoursesClient {
    
    @GetMapping("/courses/{id}")
    CourseDTO getCourseById(@PathVariable("id") Long id);
    
    @PostMapping("/courses/by-ids")
    List<CourseDTO> getCoursesByIds(@RequestBody List<Long> ids);
    
    @GetMapping("/courses")
    List<CourseDTO> getAllCourses();
}
