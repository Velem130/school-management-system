package com.issa.javahmz.controller;

import com.issa.javahmz.entity.MenStudent;
import com.issa.javahmz.service.MenStudentService;
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
@RequestMapping("/api/men-students")
public class MenStudentController {
    
    @Autowired
    private MenStudentService menStudentService;
    
    // Get all men students
    @GetMapping
    public ResponseEntity<List<MenStudent>> getAllMenStudents() {
        List<MenStudent> students = menStudentService.getAllMenStudents();
        return ResponseEntity.ok(students);
    }
    
    // Get men student by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenStudentById(@PathVariable Long id) {
        Optional<MenStudent> student = menStudentService.getMenStudentById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men student not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get men student by student ID
    @GetMapping("/by-student-id/{studentId}")
    public ResponseEntity<?> getMenStudentByStudentId(@PathVariable String studentId) {
        Optional<MenStudent> student = menStudentService.getMenStudentByStudentId(studentId);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men student not found with student ID: " + studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Get men students by teacher
    @GetMapping("/by-teacher/{ustadh}")
    public ResponseEntity<List<MenStudent>> getMenStudentsByTeacher(@PathVariable String ustadh) {
        List<MenStudent> students = menStudentService.getMenStudentsByTeacher(ustadh);
        return ResponseEntity.ok(students);
    }
    
    // Get men students by teacher and class
    @GetMapping("/by-teacher-class")
    public ResponseEntity<List<MenStudent>> getMenStudentsByTeacherAndClass(
            @RequestParam String ustadh, 
            @RequestParam String classTeaching) {
        List<MenStudent> students = menStudentService.getMenStudentsByTeacherAndClass(ustadh, classTeaching);
        return ResponseEntity.ok(students);
    }
    
    // Create new men student
    @PostMapping
    public ResponseEntity<?> createMenStudent(@RequestBody MenStudent student) {
        try {
            MenStudent createdStudent = menStudentService.createMenStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update men student
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenStudent(@PathVariable Long id, @RequestBody MenStudent studentDetails) {
        try {
            MenStudent updatedStudent = menStudentService.updateMenStudent(id, studentDetails);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete men student
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenStudent(@PathVariable Long id) {
        try {
            menStudentService.deleteMenStudent(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Men student deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete men students by teacher
    @DeleteMapping("/by-teacher/{ustadh}")
    public ResponseEntity<?> deleteMenStudentsByTeacher(@PathVariable String ustadh) {
        try {
            menStudentService.deleteMenStudentsByTeacher(ustadh);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All men students for teacher " + ustadh + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Count men students by teacher
    @GetMapping("/count-by-teacher/{ustadh}")
    public ResponseEntity<Long> countMenStudentsByTeacher(@PathVariable String ustadh) {
        Long count = menStudentService.countMenStudentsByTeacher(ustadh);
        return ResponseEntity.ok(count);
    }
    
    // Search men students
    @GetMapping("/search")
    public ResponseEntity<List<MenStudent>> searchMenStudents(@RequestParam String q) {
        List<MenStudent> students = menStudentService.searchMenStudents(q);
        return ResponseEntity.ok(students);
    }
}
