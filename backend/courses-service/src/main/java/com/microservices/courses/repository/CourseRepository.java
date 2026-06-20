package com.microservices.courses.repository;

import com.microservices.courses.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByLevel(String level);

    List<Course> findByInstructor(String instructor);

    List<Course> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT c FROM Course c WHERE " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:level IS NULL OR c.level = :level)")
    List<Course> searchCourses(@Param("search") String search, @Param("level") String level);
}
