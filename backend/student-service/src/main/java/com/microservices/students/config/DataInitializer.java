package com.microservices.students.config;

import com.microservices.students.entity.Student;
import com.microservices.students.entity.StudentCourse;
import com.microservices.students.repository.StudentCourseRepository;
import com.microservices.students.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final StudentRepository studentRepository;
    private final StudentCourseRepository studentCourseRepository;
    
    @Override
    public void run(String... args) {
        if (studentRepository.count() == 0) {
            Student student1 = new Student();
            student1.setFirstName("Alice");
            student1.setLastName("Martin");
            student1.setEmail("alice.martin@example.com");
            
            Student student2 = new Student();
            student2.setFirstName("Bob");
            student2.setLastName("Dupont");
            student2.setEmail("bob.dupont@example.com");
            
            Student student3 = new Student();
            student3.setFirstName("Charlie");
            student3.setLastName("Bernard");
            student3.setEmail("charlie.bernard@example.com");
            
            studentRepository.save(student1);
            studentRepository.save(student2);
            studentRepository.save(student3);
            
            // Associer des cours aux étudiants
            StudentCourse sc1 = new StudentCourse();
            sc1.setStudentId(1L);
            sc1.setCourseId(1L);
            
            StudentCourse sc2 = new StudentCourse();
            sc2.setStudentId(1L);
            sc2.setCourseId(2L);
            
            StudentCourse sc3 = new StudentCourse();
            sc3.setStudentId(2L);
            sc3.setCourseId(1L);
            
            StudentCourse sc4 = new StudentCourse();
            sc4.setStudentId(2L);
            sc4.setCourseId(3L);
            
            StudentCourse sc5 = new StudentCourse();
            sc5.setStudentId(3L);
            sc5.setCourseId(2L);
            
            studentCourseRepository.save(sc1);
            studentCourseRepository.save(sc2);
            studentCourseRepository.save(sc3);
            studentCourseRepository.save(sc4);
            studentCourseRepository.save(sc5);
            
            System.out.println("✅ Students initialized!");
        }
    }
}
