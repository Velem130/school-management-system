package com.issa.javahmz.controller;

import com.issa.javahmz.entity.AdultStudent;
import com.issa.javahmz.service.AdultStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/adult-students")
public class AdultStudentController {
    
    @Autowired
    private AdultStudentService adultStudentService;
    
    // Get all adult students
    @GetMapping
    public ResponseEntity<List<AdultStudent>> getAllAdultStudents() {
        List<AdultStudent> students = adultStudentService.getAllAdultStudents();
        return ResponseEntity.ok(students);
    }
    
    // Get adult student by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdultStudentById(@PathVariable Long id) {
        Optional<AdultStudent> student = adultStudentService.getAdultStudentById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult student not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get adult student by student ID
    @GetMapping("/by-student-id/{studentId}")
    public ResponseEntity<?> getAdultStudentByStudentId(@PathVariable String studentId) {
        Optional<AdultStudent> student = adultStudentService.getAdultStudentByStudentId(studentId);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult student not found with student ID: " + studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get adult students by teacher
    @GetMapping("/by-teacher/{ustadh}")
    public ResponseEntity<List<AdultStudent>> getAdultStudentsByTeacher(@PathVariable String ustadh) {
        List<AdultStudent> students = adultStudentService.getAdultStudentsByTeacher(ustadh);
        return ResponseEntity.ok(students);
    }
    
    // Get adult students by teacher and class
    @GetMapping("/by-teacher-class")
    public ResponseEntity<List<AdultStudent>> getAdultStudentsByTeacherAndClass(
            @RequestParam String ustadh, 
            @RequestParam String classTeaching) {
        List<AdultStudent> students = adultStudentService.getAdultStudentsByTeacherAndClass(ustadh, classTeaching);
        return ResponseEntity.ok(students);
    }
    
    // Create new adult student
    @PostMapping
    public ResponseEntity<?> createAdultStudent(@RequestBody AdultStudent student) {
        try {
            AdultStudent createdStudent = adultStudentService.createAdultStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update adult student
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdultStudent(@PathVariable Long id, @RequestBody AdultStudent studentDetails) {
        try {
            AdultStudent updatedStudent = adultStudentService.updateAdultStudent(id, studentDetails);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete adult student
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdultStudent(@PathVariable Long id) {
        try {
            adultStudentService.deleteAdultStudent(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult student deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete adult students by teacher
    @DeleteMapping("/by-teacher/{ustadh}")
    public ResponseEntity<?> deleteAdultStudentsByTeacher(@PathVariable String ustadh) {
        try {
            adultStudentService.deleteAdultStudentsByTeacher(ustadh);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All adult students for teacher " + ustadh + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Count adult students by teacher
    @GetMapping("/count-by-teacher/{ustadh}")
    public ResponseEntity<Long> countAdultStudentsByTeacher(@PathVariable String ustadh) {
        Long count = adultStudentService.countAdultStudentsByTeacher(ustadh);
        return ResponseEntity.ok(count);
    }
    
    // Search adult students
    @GetMapping("/search")
    public ResponseEntity<List<AdultStudent>> searchAdultStudents(@RequestParam String q) {
        List<AdultStudent> students = adultStudentService.searchAdultStudents(q);
        return ResponseEntity.ok(students);
    }
}