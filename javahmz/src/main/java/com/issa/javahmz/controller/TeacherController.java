package com.issa.javahmz.controller;

import com.issa.javahmz.entity.Teacher;
import com.issa.javahmz.service.TeacherService;
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
@RequestMapping("/api/teachers")  
public class TeacherController {
    
    @Autowired
    private TeacherService teacherService;
    
    // Get all teachers
    @GetMapping
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        List<Teacher> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }
    
    // Get teacher by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacherById(@PathVariable Long id) {
        Optional<Teacher> teacher = teacherService.getTeacherById(id);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Teacher not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Create new teacher
    @PostMapping
    public ResponseEntity<?> createTeacher(@RequestBody Teacher teacher) {
        try {
            Teacher createdTeacher = teacherService.createTeacher(teacher);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update teacher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        try {
            Teacher updatedTeacher = teacherService.updateTeacher(id, teacherDetails);
            return ResponseEntity.ok(updatedTeacher);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete teacher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacher(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Teacher deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Search teachers by name
    @GetMapping("/search")
    public ResponseEntity<List<Teacher>> searchTeachers(@RequestParam String name) {
        List<Teacher> teachers = teacherService.searchTeachers(name);
        return ResponseEntity.ok(teachers);
    }
    
    // Teacher login/access (check if teacher exists with name and class)
    @PostMapping("/access")
    public ResponseEntity<?> accessTeacher(@RequestBody Map<String, String> credentials) {
        String name = credentials.get("name");
        String classTeaching = credentials.get("classTeaching");
        
        if (name == null || classTeaching == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Name and classTeaching are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        Optional<Teacher> teacher = teacherService.getTeacherByNameAndClass(name, classTeaching);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Teacher not found with name: " + name + " and class: " + classTeaching);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}