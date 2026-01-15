package com.issa.javahmz.repository;

import com.issa.javahmz.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    // Find teacher by name
    Optional<Teacher> findByName(String name);
    
    // Find teacher by name and class (for login/access)
    Optional<Teacher> findByNameAndClassTeaching(String name, String classTeaching);
    
    // Check if teacher exists by name
    boolean existsByName(String name);
    
    // Find all teachers ordered by name
    List<Teacher> findAllByOrderByNameAsc();
    
    // Search teachers by name (case-insensitive)
    @Query("SELECT t FROM Teacher t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Teacher> searchByName(@Param("name") String name);
}
