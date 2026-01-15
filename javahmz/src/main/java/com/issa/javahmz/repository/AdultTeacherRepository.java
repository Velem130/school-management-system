package com.issa.javahmz.repository;

import com.issa.javahmz.entity.AdultTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdultTeacherRepository extends JpaRepository<AdultTeacher, Long> {
    
    // Find adult teacher by name
    Optional<AdultTeacher> findByName(String name);
    
    // Find adult teacher by name and class (for login/access)
    Optional<AdultTeacher> findByNameAndClassTeaching(String name, String classTeaching);
    
    // Check if adult teacher exists by name
    boolean existsByName(String name);
    
    // Find all adult teachers ordered by name
    List<AdultTeacher> findAllByOrderByNameAsc();
    
    // Search adult teachers by name (case-insensitive)
    @Query("SELECT t FROM AdultTeacher t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<AdultTeacher> searchByName(@Param("name") String name);
}
