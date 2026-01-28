package com.issa.javahmz.controller;

import com.issa.javahmz.entity.Student;
import com.issa.javahmz.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // Get all students
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Student not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Get student by student ID
    @GetMapping("/by-student-id/{studentId}")
    public ResponseEntity<?> getStudentByStudentId(@PathVariable String studentId) {
        Optional<Student> student = studentService.getStudentByStudentId(studentId);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Student not found with student ID: " + studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Get students by teacher
    @GetMapping("/by-teacher/{ustadh}")
    public ResponseEntity<List<Student>> getStudentsByTeacher(@PathVariable String ustadh) {
        List<Student> students = studentService.getStudentsByTeacher(ustadh);
        return ResponseEntity.ok(students);
    }

    // Get students by teacher and class
    @GetMapping("/by-teacher-class")
    public ResponseEntity<List<Student>> getStudentsByTeacherAndClass(
            @RequestParam String ustadh,
            @RequestParam String classTeaching) {
        List<Student> students = studentService.getStudentsByTeacherAndClass(ustadh, classTeaching);
        return ResponseEntity.ok(students);
    }

    // Create new student (supports ?restore=true flag)
    @PostMapping
    public ResponseEntity<?> createStudent(
            @RequestBody Student student,
            @RequestParam(required = false, defaultValue = "false") boolean restore) {
        try {
            Student createdStudent = studentService.createStudent(student, restore);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        try {
            Student updatedStudent = studentService.updateStudent(id, studentDetails);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Student deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Delete students by teacher
    @DeleteMapping("/by-teacher/{ustadh}")
    public ResponseEntity<?> deleteStudentsByTeacher(@PathVariable String ustadh) {
        try {
            studentService.deleteStudentsByTeacher(ustadh);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All students for teacher " + ustadh + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Count students by teacher
    @GetMapping("/count-by-teacher/{ustadh}")
    public ResponseEntity<Long> countStudentsByTeacher(@PathVariable String ustadh) {
        Long count = studentService.countStudentsByTeacher(ustadh);
        return ResponseEntity.ok(count);
    }

    // Search students
    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String q) {
        List<Student> students = studentService.searchStudents(q);
        return ResponseEntity.ok(students);
    }

    // Get student by database ID
    @GetMapping("/by-id/{id}")
    public ResponseEntity<?> getStudentByDbId(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentById(id);
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Student not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Update classTeaching for all students of a specific teacher
    @PutMapping("/update-class")
    public ResponseEntity<?> updateStudentsClass(
            @RequestParam String ustadh,
            @RequestParam String oldClassTeaching,
            @RequestParam String newClassTeaching) {
        try {
            studentService.updateStudentsClass(ustadh, oldClassTeaching, newClassTeaching);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All students updated to new class successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // TRANSFER ENDPOINT - This handles the frontend transfer request
    @PostMapping("/transfer/{id}")
    public ResponseEntity<?> transferStudent(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String newUstadh = payload.get("newUstadh");
            String newClassTeaching = payload.get("newClassTeaching");
            String transferredBy = payload.get("transferredBy");
            String notes = payload.getOrDefault("notes", "");

            if (newUstadh == null || newUstadh.trim().isEmpty() ||
                newClassTeaching == null || newClassTeaching.trim().isEmpty() ||
                transferredBy == null || transferredBy.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Missing or empty required fields: newUstadh, newClassTeaching, transferredBy");
                return ResponseEntity.badRequest().body(error);
            }

            Student updatedStudent = studentService.transferStudent(
                    id, newUstadh.trim(), newClassTeaching.trim(), transferredBy.trim(), notes.trim()
            );

            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Internal server error during transfer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}