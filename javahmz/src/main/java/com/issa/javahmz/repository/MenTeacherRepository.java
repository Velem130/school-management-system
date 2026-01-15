package com.issa.javahmz.repository;

import com.issa.javahmz.entity.MenTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenTeacherRepository extends JpaRepository<MenTeacher, Long> {
    
    // Find men teacher by name
    Optional<MenTeacher> findByName(String name);
    
    // Find men teacher by name and class (for login/access)
    Optional<MenTeacher> findByNameAndClassTeaching(String name, String classTeaching);
    
    // Check if men teacher exists by name
    boolean existsByName(String name);
    
    // Find all men teachers ordered by name
    List<MenTeacher> findAllByOrderByNameAsc();
    
    // Search men teachers by name (case-insensitive)
    @Query("SELECT t FROM MenTeacher t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<MenTeacher> searchByName(@Param("name") String name);
}
