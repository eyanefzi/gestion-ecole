package com.microservices.courses.config;

import com.microservices.courses.entity.Course;
import com.microservices.courses.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final CourseRepository courseRepository;
    
    @Override
    public void run(String... args) {
        if (courseRepository.count() == 0) {
            Course course1 = new Course();
            course1.setTitle("Spring Boot Fundamentals");
            course1.setDescription("Learn the basics of Spring Boot");
            course1.setInstructor("John Doe");
            course1.setDurationHours(40);
            course1.setLevel("BEGINNER");
            
            Course course2 = new Course();
            course2.setTitle("Microservices Architecture");
            course2.setDescription("Build scalable microservices");
            course2.setInstructor("Jane Smith");
            course2.setDurationHours(60);
            course2.setLevel("INTERMEDIATE");
            
            Course course3 = new Course();
            course3.setTitle("Docker & Kubernetes");
            course3.setDescription("Container orchestration");
            course3.setInstructor("Bob Johnson");
            course3.setDurationHours(50);
            course3.setLevel("ADVANCED");
            
            courseRepository.save(course1);
            courseRepository.save(course2);
            courseRepository.save(course3);
            
            System.out.println("✅ Courses initialized!");
        }
    }
}
