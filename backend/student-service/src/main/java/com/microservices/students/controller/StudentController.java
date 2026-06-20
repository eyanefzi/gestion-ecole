package com.microservices.students.controller;

import com.microservices.students.dto.StudentDTO;
import com.microservices.students.dto.StudentWithCoursesDTO;
import com.microservices.students.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {
    
    private final StudentService studentService;
    
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        List<StudentDTO> students;
        if (search != null && !search.isBlank()) {
            students = studentService.searchStudents(search);
        } else {
            students = studentService.getAllStudents();
        }
        if (sortBy != null && !sortBy.isEmpty()) {
            students = studentService.sortStudents(students, sortBy, sortDir);
        }
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }
    
    @GetMapping("/{id}/courses")
    public ResponseEntity<StudentWithCoursesDTO> getStudentWithCourses(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentWithCourses(id));
    }
    
    @PostMapping("/{studentId}/courses/{courseId}")
    public ResponseEntity<Void> enrollStudentInCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        studentService.enrollStudentInCourse(studentId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @DeleteMapping("/{studentId}/courses/{courseId}")
    public ResponseEntity<Void> unenrollStudentFromCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        studentService.unenrollStudentFromCourse(studentId, courseId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody StudentDTO studentDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(studentService.createStudent(studentDTO));
        } catch (org.springframework.dao.DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/enrollments")
    public ResponseEntity<List<com.microservices.students.entity.StudentCourse>> getAllEnrollments() {
        return ResponseEntity.ok(studentService.getAllEnrollments());
    }
    
    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<List<StudentDTO>> getStudentsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(studentService.getStudentsByCourseId(courseId));
    }
}
