package com.issa.javahmz.repository;

import com.issa.javahmz.entity.AdultStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdultStudentRepository extends JpaRepository<AdultStudent, Long> {
    
    // Find adult student by student ID
    Optional<AdultStudent> findByStudentId(String studentId);
    
    // Find adult students by teacher name
    List<AdultStudent> findByUstadh(String ustadh);
    
    // Find adult students by teacher name and class
    List<AdultStudent> findByUstadhAndClassTeaching(String ustadh, String classTeaching);
    
    // Check if adult student with ID exists
    boolean existsByStudentId(String studentId);
    
    // Check if adult student with name and ID exists (case insensitive)
    @Query("SELECT COUNT(s) > 0 FROM AdultStudent s WHERE LOWER(s.name) = LOWER(:name) AND s.studentId = :studentId")
    boolean existsByNameAndStudentId(@Param("name") String name, @Param("studentId") String studentId);
    
    // Find all adult students ordered by name
    List<AdultStudent> findAllByOrderByNameAsc();
    
    // Count adult students by teacher
    @Query("SELECT COUNT(s) FROM AdultStudent s WHERE s.ustadh = :ustadh")
    Long countByUstadh(@Param("ustadh") String ustadh);
    
    // Search adult students by name or ID
    @Query("SELECT s FROM AdultStudent s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR s.studentId LIKE CONCAT('%', :searchTerm, '%')")
    List<AdultStudent> searchByNameOrId(@Param("searchTerm") String searchTerm);
}
