package com.issa.javahmz.controller;

import com.issa.javahmz.entity.ExcludedStudent;
import com.issa.javahmz.entity.Student;
import com.issa.javahmz.service.ExcludedStudentService;
import com.issa.javahmz.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/exclude")
public class ExcludeController {
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private ExcludedStudentService excludedStudentService;
    
    // Exclude a student (move from active to excluded)
    @PostMapping("/student/{studentId}")
    public ResponseEntity<?> excludeStudent(
            @PathVariable Long studentId,
            @RequestBody Map<String, String> exclusionData) {
        
        try {
            // Get the student to exclude
            Student student = studentService.getStudentById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
            
            // Get exclusion details
            String excludedBy = exclusionData.get("excludedBy");
            String reason = exclusionData.get("reason");
            String exclusionType = exclusionData.get("exclusionType");
            String additionalNotes = exclusionData.get("additionalNotes");
            
            if (excludedBy == null || reason == null || exclusionType == null) {
                throw new RuntimeException("excludedBy, reason, and exclusionType are required");
            }
            
            // Save to excluded students
            ExcludedStudent excludedStudent = excludedStudentService.excludeStudent(
                    student, excludedBy, reason, exclusionType, additionalNotes
            );
            
            // Delete from active students
            studentService.deleteStudent(studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student excluded successfully");
            response.put("excludedStudent", excludedStudent);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}