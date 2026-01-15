package com.issa.javahmz.repository;

import com.issa.javahmz.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Find student by student ID
    Optional<Student> findByStudentId(String studentId);
    
    // Find students by teacher name
    List<Student> findByUstadh(String ustadh);
    
    // Find students by teacher name and class
    List<Student> findByUstadhAndClassTeaching(String ustadh, String classTeaching);
    
    // Check if student with ID exists
    boolean existsByStudentId(String studentId);
    
    // Check if student with name and ID exists (case insensitive)
    @Query("SELECT COUNT(s) > 0 FROM Student s WHERE LOWER(s.name) = LOWER(:name) AND s.studentId = :studentId")
    boolean existsByNameAndStudentId(@Param("name") String name, @Param("studentId") String studentId);
    
    // Find all students ordered by name
    List<Student> findAllByOrderByNameAsc();
    
    // Count students by teacher
    @Query("SELECT COUNT(s) FROM Student s WHERE s.ustadh = :ustadh")
    Long countByUstadh(@Param("ustadh") String ustadh);
    
    // Search students by name or ID
    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR s.studentId LIKE CONCAT('%', :searchTerm, '%')")
    List<Student> searchByNameOrId(@Param("searchTerm") String searchTerm);
}
