package com.issa.javahmz.repository;

import com.issa.javahmz.entity.MenStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenStudentRepository extends JpaRepository<MenStudent, Long> {
    
    // Find men student by student ID
    Optional<MenStudent> findByStudentId(String studentId);
    
    // Find men students by teacher name
    List<MenStudent> findByUstadh(String ustadh);
    
    // Find men students by teacher name and class
    List<MenStudent> findByUstadhAndClassTeaching(String ustadh, String classTeaching);
    
    // Check if men student with ID exists
    boolean existsByStudentId(String studentId);
    
    // Check if men student with name and ID exists (case insensitive)
    @Query("SELECT COUNT(s) > 0 FROM MenStudent s WHERE LOWER(s.name) = LOWER(:name) AND s.studentId = :studentId")
    boolean existsByNameAndStudentId(@Param("name") String name, @Param("studentId") String studentId);
    
    // Find all men students ordered by name
    List<MenStudent> findAllByOrderByNameAsc();
    
    // Count men students by teacher
    @Query("SELECT COUNT(s) FROM MenStudent s WHERE s.ustadh = :ustadh")
    Long countByUstadh(@Param("ustadh") String ustadh);
    
    // Search men students by name or ID
    @Query("SELECT s FROM MenStudent s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR s.studentId LIKE CONCAT('%', :searchTerm, '%')")
    List<MenStudent> searchByNameOrId(@Param("searchTerm") String searchTerm);
}
