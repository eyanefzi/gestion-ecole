package com.microservices.courses.controller;

import com.microservices.courses.dto.CourseDTO;
import com.microservices.courses.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {
    
    private final CourseService courseService;
    
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        List<CourseDTO> courses;
        if (search != null || level != null) {
            courses = courseService.searchCourses(search, level);
        } else {
            courses = courseService.getAllCourses();
        }
        if (sortBy != null && !sortBy.isEmpty()) {
            courses = courseService.sortCourses(courses, sortBy, sortDir);
        }
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
    
    @GetMapping("/{id}/students")
    public ResponseEntity<com.microservices.courses.dto.CourseWithStudentsDTO> getCourseWithStudents(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseWithStudents(id));
    }
    
    @PostMapping("/by-ids")
    public ResponseEntity<List<CourseDTO>> getCoursesByIds(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(courseService.getCoursesByIds(ids));
    }
    
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(courseDTO));
    }


    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.updateCourse(id, courseDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

}
