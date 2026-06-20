package com.microservices.students.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentWithCoursesDTO {
    private StudentDTO student;
    private List<CourseDTO> courses;
}
