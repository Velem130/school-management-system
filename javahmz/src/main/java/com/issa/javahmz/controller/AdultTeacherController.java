package com.issa.javahmz.controller;

import com.issa.javahmz.entity.AdultTeacher;
import com.issa.javahmz.service.AdultTeacherService;
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
@RequestMapping("/api/adult-teachers")
public class AdultTeacherController {
    
    @Autowired
    private AdultTeacherService adultTeacherService;
    
    // Get all adult teachers
    @GetMapping
    public ResponseEntity<List<AdultTeacher>> getAllAdultTeachers() {
        List<AdultTeacher> teachers = adultTeacherService.getAllAdultTeachers();
        return ResponseEntity.ok(teachers);
    }
    
    // Get adult teacher by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdultTeacherById(@PathVariable Long id) {
        Optional<AdultTeacher> teacher = adultTeacherService.getAdultTeacherById(id);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult teacher not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Create new adult teacher
    @PostMapping
    public ResponseEntity<?> createAdultTeacher(@RequestBody AdultTeacher teacher) {
        try {
            AdultTeacher createdTeacher = adultTeacherService.createAdultTeacher(teacher);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update adult teacher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdultTeacher(@PathVariable Long id, @RequestBody AdultTeacher teacherDetails) {
        try {
            AdultTeacher updatedTeacher = adultTeacherService.updateAdultTeacher(id, teacherDetails);
            return ResponseEntity.ok(updatedTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete adult teacher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdultTeacher(@PathVariable Long id) {
        try {
            adultTeacherService.deleteAdultTeacher(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult teacher deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Search adult teachers by name
    @GetMapping("/search")
    public ResponseEntity<List<AdultTeacher>> searchAdultTeachers(@RequestParam String name) {
        List<AdultTeacher> teachers = adultTeacherService.searchAdultTeachers(name);
        return ResponseEntity.ok(teachers);
    }
    
    // Adult teacher login/access
    @PostMapping("/access")
    public ResponseEntity<?> accessAdultTeacher(@RequestBody Map<String, String> credentials) {
        String name = credentials.get("name");
        String classTeaching = credentials.get("classTeaching");
        
        if (name == null || classTeaching == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Name and classTeaching are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        Optional<AdultTeacher> teacher = adultTeacherService.getAdultTeacherByNameAndClass(name, classTeaching);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Adult teacher not found with name: " + name + " and class: " + classTeaching);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}