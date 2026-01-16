package com.issa.javahmz.repository;

import com.issa.javahmz.entity.ExcludedStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExcludedStudentRepository extends JpaRepository<ExcludedStudent, Long> {
    
    // Find excluded students by student ID
    List<ExcludedStudent> findByStudentId(String studentId);
    
    // Find excluded students by teacher name
    List<ExcludedStudent> findByUstadh(String ustadh);
    
    // Find excluded students by class
    List<ExcludedStudent> findByClassTeaching(String classTeaching);
    
    // Find excluded students by exclusion type
    List<ExcludedStudent> findByExclusionType(String exclusionType);
    
    // Find excluded students by date range
    List<ExcludedStudent> findByExcludedDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Count excluded students by teacher
    @Query("SELECT COUNT(e) FROM ExcludedStudent e WHERE e.ustadh = :ustadh")
    Long countByUstadh(@Param("ustadh") String ustadh);
    
    // Count excluded students this month
    @Query("SELECT COUNT(e) FROM ExcludedStudent e " +
           "WHERE FUNCTION('YEAR', e.excludedDate) = :year " +
           "AND FUNCTION('MONTH', e.excludedDate) = :month")
    Long countByMonth(@Param("year") int year, @Param("month") int month);
    
    // Count excluded students by exclusion type - ADDED THIS METHOD
    @Query("SELECT COUNT(e) FROM ExcludedStudent e WHERE e.exclusionType = :exclusionType")
    Long countByExclusionType(@Param("exclusionType") String exclusionType);
    
    // Search excluded students by name or ID or reason
    @Query("SELECT e FROM ExcludedStudent e " +
           "WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR e.studentId LIKE CONCAT('%', :searchTerm, '%') " +
           "OR LOWER(e.reason) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ExcludedStudent> searchByNameIdOrReason(@Param("searchTerm") String searchTerm);
    
    // Get all excluded students ordered by exclusion date (newest first)
    List<ExcludedStudent> findAllByOrderByExcludedDateDesc();
    
    // Check if student was already excluded in same class
    boolean existsByStudentIdAndUstadhAndClassTeaching(
            String studentId, String ustadh, String classTeaching);
    
    // NEW: Delete all records older than a given date (used for 3-year cleanup)
    @Modifying
    @Query("DELETE FROM ExcludedStudent e WHERE e.excludedDate < :date")
    long deleteByExcludedDateBefore(@Param("date") LocalDate date);

    // Check if student ID exists in excluded students
    boolean existsByStudentId(String studentId);
}