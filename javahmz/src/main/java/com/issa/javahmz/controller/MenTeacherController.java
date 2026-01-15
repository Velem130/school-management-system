package com.issa.javahmz.controller;

import com.issa.javahmz.entity.MenTeacher;
import com.issa.javahmz.service.MenTeacherService;
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
@RequestMapping("/api/men-teachers")
public class MenTeacherController {
    
    @Autowired
    private MenTeacherService menTeacherService;
    
    // Get all men teachers
    @GetMapping
    public ResponseEntity<List<MenTeacher>> getAllMenTeachers() {
        List<MenTeacher> teachers = menTeacherService.getAllMenTeachers();
        return ResponseEntity.ok(teachers);
    }
    
    // Get men teacher by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenTeacherById(@PathVariable Long id) {
        Optional<MenTeacher> teacher = menTeacherService.getMenTeacherById(id);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men teacher not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Create new men teacher
    @PostMapping
    public ResponseEntity<?> createMenTeacher(@RequestBody MenTeacher teacher) {
        try {
            MenTeacher createdTeacher = menTeacherService.createMenTeacher(teacher);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update men teacher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenTeacher(@PathVariable Long id, @RequestBody MenTeacher teacherDetails) {
        try {
            MenTeacher updatedTeacher = menTeacherService.updateMenTeacher(id, teacherDetails);
            return ResponseEntity.ok(updatedTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete men teacher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenTeacher(@PathVariable Long id) {
        try {
            menTeacherService.deleteMenTeacher(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men teacher deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Search men teachers by name
    @GetMapping("/search")
    public ResponseEntity<List<MenTeacher>> searchMenTeachers(@RequestParam String name) {
        List<MenTeacher> teachers = menTeacherService.searchMenTeachers(name);
        return ResponseEntity.ok(teachers);
    }
    
    // Men teacher login/access
    @PostMapping("/access")
    public ResponseEntity<?> accessMenTeacher(@RequestBody Map<String, String> credentials) {
        String name = credentials.get("name");
        String classTeaching = credentials.get("classTeaching");
        
        if (name == null || classTeaching == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Name and classTeaching are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        Optional<MenTeacher> teacher = menTeacherService.getMenTeacherByNameAndClass(name, classTeaching);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men teacher not found with name: " + name + " and class: " + classTeaching);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
