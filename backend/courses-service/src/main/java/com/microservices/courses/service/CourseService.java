package com.microservices.courses.service;

import com.microservices.courses.client.StudentsClient;
import com.microservices.courses.dto.CourseDTO;
import com.microservices.courses.dto.CourseWithStudentsDTO;
import com.microservices.courses.dto.StudentDTO;
import com.microservices.courses.entity.Course;
import com.microservices.courses.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final StudentsClient studentsClient;
    
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> searchCourses(String search, String level) {
        String searchParam = (search != null && !search.isBlank()) ? search : null;
        String levelParam = (level != null && !level.isBlank()) ? level : null;
        return courseRepository.searchCourses(searchParam, levelParam).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> sortCourses(List<CourseDTO> courses, String sortBy, String sortDir) {
        java.util.Comparator<CourseDTO> comparator = switch (sortBy) {
            case "instructor" -> java.util.Comparator.comparing(c -> c.getInstructor() != null ? c.getInstructor().toLowerCase() : "");
            case "durationHours" -> java.util.Comparator.comparingInt(c -> c.getDurationHours() != null ? c.getDurationHours() : 0);
            case "level" -> java.util.Comparator.comparing(c -> c.getLevel() != null ? c.getLevel() : "");
            default -> java.util.Comparator.comparing(c -> c.getTitle() != null ? c.getTitle().toLowerCase() : "");
        };
        if ("desc".equalsIgnoreCase(sortDir)) comparator = comparator.reversed();
        return courses.stream().sorted(comparator).collect(Collectors.toList());
    }
    
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return convertToDTO(course);
    }
    
    public List<CourseDTO> getCoursesByIds(List<Long> ids) {
        return courseRepository.findAllById(ids).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = convertToEntity(courseDTO);
        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }
    
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setTitle(courseDTO.getTitle());
        course.setDescription(courseDTO.getDescription());
        course.setInstructor(courseDTO.getInstructor());
        course.setDurationHours(courseDTO.getDurationHours());
        course.setLevel(courseDTO.getLevel());
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }
    
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }
    
    /**
     * FEIGN CLIENT SCENARIO 2: Get course with enrolled students
     * Calls Students Service via Feign to retrieve all students enrolled in this course
     */
    public CourseWithStudentsDTO getCourseWithStudents(Long courseId) {
        // Get course details
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Call Students Service via Feign to get enrolled students
        List<StudentDTO> enrolledStudents;
        try {
            enrolledStudents = studentsClient.getStudentsByCourseId(courseId);
        } catch (Exception e) {
            // Fallback: return empty list if Students Service is unavailable
            enrolledStudents = List.of();
        }
        
        // Build response DTO
        CourseWithStudentsDTO result = new CourseWithStudentsDTO();
        result.setId(course.getId());
        result.setTitle(course.getTitle());
        result.setDescription(course.getDescription());
        result.setInstructor(course.getInstructor());
        result.setLevel(course.getLevel());
        result.setDuration(course.getDurationHours());
        result.setEnrolledStudents(enrolledStudents);
        result.setTotalEnrollments(enrolledStudents.size());
        
        return result;
    }
    
    private CourseDTO convertToDTO(Course course) {
        return new CourseDTO(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructor(),
                course.getDurationHours(),
                course.getLevel()
        );
    }
    
    private Course convertToEntity(CourseDTO dto) {
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setInstructor(dto.getInstructor());
        course.setDurationHours(dto.getDurationHours());
        course.setLevel(dto.getLevel());
        return course;
    }
}
