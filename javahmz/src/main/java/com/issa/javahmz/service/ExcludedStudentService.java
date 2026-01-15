package com.issa.javahmz.service;

import com.issa.javahmz.entity.ExcludedStudent;
import com.issa.javahmz.entity.Student;
import com.issa.javahmz.repository.ExcludedStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExcludedStudentService {
    
    @Autowired
    private ExcludedStudentRepository excludedStudentRepository;
    
    // Get all excluded students
    public List<ExcludedStudent> getAllExcludedStudents() {
        return excludedStudentRepository.findAllByOrderByExcludedDateDesc();
    }
    
    // Get excluded student by ID
    public ExcludedStudent getExcludedStudentById(Long id) {
        return excludedStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Excluded student not found with id: " + id));
    }
    
    // Exclude a student (create excluded record) - with stricter duplicate ID check
    public ExcludedStudent excludeStudent(Student student, String excludedBy, String reason, 
                                         String exclusionType, String additionalNotes) {
        
        String studentId = student.getStudentId();
        
        // NEW: Prevent re-excluding the same ID (permanent block)
        if (excludedStudentRepository.existsByStudentId(studentId)) {
            throw new IllegalArgumentException(
                "Cannot exclude student: ID '" + studentId + "' is already excluded " +
                "(this ID is permanently blocked and cannot be reused or re-excluded)"
            );
        }
        
        // Optional: Also check if ID exists in active students (extra safety)
        // If you want, inject StudentRepository and add:
        // if (studentRepository.existsByStudentId(studentId)) {
        //     throw new IllegalArgumentException("Cannot exclude: ID '" + studentId + "' is still active");
        // }
        
        ExcludedStudent excludedStudent = new ExcludedStudent(
                student, excludedBy, reason, exclusionType, additionalNotes
        );
        
        return excludedStudentRepository.save(excludedStudent);
    }
    
    // Get excluded students by teacher
    public List<ExcludedStudent> getExcludedStudentsByTeacher(String ustadh) {
        return excludedStudentRepository.findByUstadh(ustadh);
    }
    
    // Get excluded students by class
    public List<ExcludedStudent> getExcludedStudentsByClass(String classTeaching) {
        return excludedStudentRepository.findByClassTeaching(classTeaching);
    }
    
    // Get excluded students by teacher and class
    public List<ExcludedStudent> getExcludedStudentsByTeacherAndClass(String ustadh, String classTeaching) {
        List<ExcludedStudent> allByTeacher = excludedStudentRepository.findByUstadh(ustadh);
        return allByTeacher.stream()
                .filter(student -> student.getClassTeaching().equals(classTeaching))
                .toList();
    }
    
    // Get excluded students by exclusion type
    public List<ExcludedStudent> getExcludedStudentsByType(String exclusionType) {
        return excludedStudentRepository.findByExclusionType(exclusionType);
    }
    
    // Get excluded students by date range
    public List<ExcludedStudent> getExcludedStudentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return excludedStudentRepository.findByExcludedDateBetween(startDate, endDate);
    }
    
    // Get excluded students this month
    public List<ExcludedStudent> getExcludedStudentsThisMonth() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        return excludedStudentRepository.findByExcludedDateBetween(startOfMonth, endOfMonth);
    }
    
    // Search excluded students
    public List<ExcludedStudent> searchExcludedStudents(String searchTerm) {
        return excludedStudentRepository.searchByNameIdOrReason(searchTerm);
    }
    
    // Delete excluded student (permanent deletion)
    public void deleteExcludedStudent(Long id) {
        ExcludedStudent excludedStudent = excludedStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Excluded student not found with id: " + id));
        excludedStudentRepository.delete(excludedStudent);
    }
    
    // Count all excluded students
    public Long countAllExcludedStudents() {
        return excludedStudentRepository.count();
    }
    
    // Count excluded students by teacher
    public Long countExcludedStudentsByTeacher(String ustadh) {
        return excludedStudentRepository.countByUstadh(ustadh);
    }
    
    // Count excluded students this month
    public Long countExcludedStudentsThisMonth() {
        LocalDate now = LocalDate.now();
        return excludedStudentRepository.countByMonth(now.getYear(), now.getMonthValue());
    }
}