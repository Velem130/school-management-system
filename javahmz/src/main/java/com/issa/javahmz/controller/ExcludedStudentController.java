package com.issa.javahmz.controller;

import com.issa.javahmz.entity.ExcludedStudent;
import com.issa.javahmz.service.ExcludedStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/excluded-students")
public class ExcludedStudentController {
    
    @Autowired
    private ExcludedStudentService excludedStudentService;
    
    // Get all excluded students
    @GetMapping
    public ResponseEntity<List<ExcludedStudent>> getAllExcludedStudents() {
        List<ExcludedStudent> excludedStudents = excludedStudentService.getAllExcludedStudents();
        return ResponseEntity.ok(excludedStudents);
    }
    
    // Get excluded student by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getExcludedStudentById(@PathVariable Long id) {
        try {
            ExcludedStudent excludedStudent = excludedStudentService.getExcludedStudentById(id);
            return ResponseEntity.ok(excludedStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get excluded students by teacher
    @GetMapping("/by-teacher/{ustadh}")
    public ResponseEntity<List<ExcludedStudent>> getExcludedStudentsByTeacher(@PathVariable String ustadh) {
        List<ExcludedStudent> excludedStudents = excludedStudentService.getExcludedStudentsByTeacher(ustadh);
        return ResponseEntity.ok(excludedStudents);
    }
    
    // Get excluded students by teacher and class
    @GetMapping("/by-teacher-class")
    public ResponseEntity<List<ExcludedStudent>> getExcludedStudentsByTeacherAndClass(
            @RequestParam String ustadh, 
            @RequestParam String classTeaching) {
        List<ExcludedStudent> excludedStudents = excludedStudentService.getExcludedStudentsByTeacherAndClass(ustadh, classTeaching);
        return ResponseEntity.ok(excludedStudents);
    }
    
    // Get excluded students this month
    @GetMapping("/this-month")
    public ResponseEntity<List<ExcludedStudent>> getExcludedStudentsThisMonth() {
        List<ExcludedStudent> excludedStudents = excludedStudentService.getExcludedStudentsThisMonth();
        return ResponseEntity.ok(excludedStudents);
    }
    
    // Search excluded students
    @GetMapping("/search")
    public ResponseEntity<List<ExcludedStudent>> searchExcludedStudents(@RequestParam String q) {
        List<ExcludedStudent> excludedStudents = excludedStudentService.searchExcludedStudents(q);
        return ResponseEntity.ok(excludedStudents);
    }
    
    // Delete excluded student (permanent)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExcludedStudent(@PathVariable Long id) {
        try {
            excludedStudentService.deleteExcludedStudent(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Excluded student permanently deleted");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalExcluded = excludedStudentService.countAllExcludedStudents();
        Long excludedThisMonth = excludedStudentService.countExcludedStudentsThisMonth();
        
        stats.put("totalExcluded", totalExcluded);
        stats.put("excludedThisMonth", excludedThisMonth);
        
        return ResponseEntity.ok(stats);
    }
}