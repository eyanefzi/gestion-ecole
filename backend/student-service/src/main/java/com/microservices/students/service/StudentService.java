package com.microservices.students.service;

import com.microservices.students.client.CoursesClient;
import com.microservices.students.dto.CourseDTO;
import com.microservices.students.dto.StudentDTO;
import com.microservices.students.dto.StudentWithCoursesDTO;
import com.microservices.students.entity.Student;
import com.microservices.students.entity.StudentCourse;
import com.microservices.students.messaging.StudentEventPublisher;
import com.microservices.students.messaging.events.StudentEnrolledEvent;
import com.microservices.students.repository.StudentCourseRepository;
import com.microservices.students.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final StudentCourseRepository studentCourseRepository;
    private final CoursesClient coursesClient;
    private final StudentEventPublisher eventPublisher;
    
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> searchStudents(String search) {
        return studentRepository.searchStudents(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> sortStudents(List<StudentDTO> students, String sortBy, String sortDir) {
        java.util.Comparator<StudentDTO> comparator = switch (sortBy) {
            case "lastName" -> java.util.Comparator.comparing(s -> s.getLastName() != null ? s.getLastName().toLowerCase() : "");
            case "email" -> java.util.Comparator.comparing(s -> s.getEmail() != null ? s.getEmail().toLowerCase() : "");
            case "enrollmentDate" -> java.util.Comparator.comparing(s -> s.getEnrollmentDate() != null ? s.getEnrollmentDate().toString() : "");
            default -> java.util.Comparator.comparing(s -> s.getFirstName() != null ? s.getFirstName().toLowerCase() : "");
        };
        if ("desc".equalsIgnoreCase(sortDir)) comparator = comparator.reversed();
        return students.stream().sorted(comparator).collect(Collectors.toList());
    }
    
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        return convertToDTO(student);
    }
    
    public StudentWithCoursesDTO getStudentWithCourses(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        List<StudentCourse> studentCourses = studentCourseRepository.findByStudentId(studentId);
        List<Long> courseIds = studentCourses.stream()
                .map(StudentCourse::getCourseId)
                .collect(Collectors.toList());
        
        // Communication avec Courses Service via OpenFeign
        List<CourseDTO> courses = courseIds.isEmpty() 
                ? List.of() 
                : coursesClient.getCoursesByIds(courseIds);
        
        return new StudentWithCoursesDTO(convertToDTO(student), courses);
    }
    
    public StudentDTO createStudent(StudentDTO studentDTO) {
        if (studentRepository.findByEmail(studentDTO.getEmail()).isPresent()) {
            throw new org.springframework.dao.DuplicateKeyException("Student with email " + studentDTO.getEmail() + " already exists");
        }
        Student student = convertToEntity(studentDTO);
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setEmail(studentDTO.getEmail());
        if (studentDTO.getEnrollmentDate() != null) {
            student.setEnrollmentDate(studentDTO.getEnrollmentDate());
        }
        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }
    
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }
    
    public void enrollStudentInCourse(Long studentId, Long courseId) {
        // Vérifier que l'étudiant existe
        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException("Student not found with id: " + studentId);
        }
        
        // Vérifier que le cours existe via Feign
        try {
            coursesClient.getCourseById(courseId);
        } catch (Exception e) {
            throw new RuntimeException("Course not found with id: " + courseId);
        }
        
        // Vérifier si l'inscription existe déjà
        List<StudentCourse> existing = studentCourseRepository.findByStudentId(studentId);
        boolean alreadyEnrolled = existing.stream()
                .anyMatch(sc -> sc.getCourseId().equals(courseId));
        
        if (alreadyEnrolled) {
            throw new RuntimeException("Student is already enrolled in this course");
        }
        
        // Créer l'inscription
        StudentCourse studentCourse = new StudentCourse();
        studentCourse.setStudentId(studentId);
        studentCourse.setCourseId(courseId);
        studentCourseRepository.save(studentCourse);

        // Publish async event to RabbitMQ → consumed by Clubs Service
        try {
            Student student = studentRepository.findById(studentId).orElse(null);
            CourseDTO course = null;
            try { course = coursesClient.getCourseById(courseId); } catch (Exception ignored) {}

            StudentEnrolledEvent event = new StudentEnrolledEvent(
                    studentId,
                    student != null ? student.getFirstName() + " " + student.getLastName() : "Unknown",
                    student != null ? student.getEmail() : "",
                    courseId,
                    course != null ? course.getTitle() : "Course #" + courseId,
                    LocalDateTime.now()
            );
            eventPublisher.publishStudentEnrolled(event);
        } catch (Exception e) {
            // RabbitMQ failure must not block enrollment
            org.slf4j.LoggerFactory.getLogger(StudentService.class)
                    .warn("[RabbitMQ] Failed to publish StudentEnrolledEvent: {}", e.getMessage());
        }
    }
    
    public void unenrollStudentFromCourse(Long studentId, Long courseId) {
        List<StudentCourse> enrollments = studentCourseRepository.findByStudentId(studentId);
        StudentCourse enrollment = enrollments.stream()
                .filter(sc -> sc.getCourseId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        studentCourseRepository.delete(enrollment);
    }
    
    private StudentDTO convertToDTO(Student student) {
        return new StudentDTO(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getEnrollmentDate()
        );
    }
    
    private Student convertToEntity(StudentDTO dto) {
        Student student = new Student();
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setEnrollmentDate(dto.getEnrollmentDate());
        return student;
    }
    
    public List<StudentCourse> getAllEnrollments() {
        return studentCourseRepository.findAll();
    }
    
    /**
     * Get all students enrolled in a specific course
     * Used by Courses Service via Feign Client
     */
    public List<StudentDTO> getStudentsByCourseId(Long courseId) {
        List<StudentCourse> enrollments = studentCourseRepository.findByCourseId(courseId);
        List<Long> studentIds = enrollments.stream()
                .map(StudentCourse::getStudentId)
                .collect(Collectors.toList());
        
        return studentRepository.findAllById(studentIds).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
