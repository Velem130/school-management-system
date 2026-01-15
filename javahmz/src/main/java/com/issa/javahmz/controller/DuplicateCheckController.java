package com.issa.javahmz.controller;

import com.issa.javahmz.entity.Student;
import com.issa.javahmz.entity.AdultStudent;
import com.issa.javahmz.entity.MenStudent;
import com.issa.javahmz.entity.ExcludedStudent;
import com.issa.javahmz.repository.StudentRepository;
import com.issa.javahmz.repository.AdultStudentRepository;
import com.issa.javahmz.repository.MenStudentRepository;
import com.issa.javahmz.repository.ExcludedStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/check-duplicate")
public class DuplicateCheckController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private AdultStudentRepository adultStudentRepository;
    
    @Autowired
    private MenStudentRepository menStudentRepository;
    
    @Autowired
    private ExcludedStudentRepository excludedStudentRepository;
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> checkStudentDuplicate(@PathVariable String studentId) {
        Map<String, Object> response = new HashMap<>();
        
        // Check in regular students
        Optional<Student> regularStudent = studentRepository.findByStudentId(studentId);
        if (regularStudent.isPresent()) {
            response.put("exists", true);
            response.put("type", "REGULAR_STUDENT");
            response.put("data", regularStudent.get());
            response.put("message", "Student already registered as regular student with ID: " + studentId);
            return ResponseEntity.ok(response);
        }
        
        // Check in adult students
        Optional<AdultStudent> adultStudent = adultStudentRepository.findByStudentId(studentId);
        if (adultStudent.isPresent()) {
            response.put("exists", true);
            response.put("type", "ADULT_STUDENT");
            response.put("data", adultStudent.get());
            response.put("message", "Student already registered as adult student with ID: " + studentId);
            return ResponseEntity.ok(response);
        }
        
        // Check in men's list
        Optional<MenStudent> menStudent = menStudentRepository.findByStudentId(studentId);
        if (menStudent.isPresent()) {
            response.put("exists", true);
            response.put("type", "MEN_STUDENT");
            response.put("data", menStudent.get());
            response.put("message", "Student already registered in men's list with ID: " + studentId);
            return ResponseEntity.ok(response);
        }
        
        // Check in excluded students (not expired)
        Optional<ExcludedStudent> excludedStudent = excludedStudentRepository.findByStudentId(studentId)
            .stream()
            .filter(es -> {
                // Check if excluded within last 3 years
                LocalDate threeYearsAgo = LocalDate.now().minusYears(3);
                return es.getExcludedDate().isAfter(threeYearsAgo);
            })
            .findFirst();
            
        if (excludedStudent.isPresent()) {
            response.put("exists", true);
            response.put("type", "EXCLUDED_STUDENT");
            response.put("data", excludedStudent.get());
            response.put("message", "Student was excluded on " + excludedStudent.get().getExcludedDate() + " and cannot re-register yet");
            return ResponseEntity.ok(response);
        }
        
        response.put("exists", false);
        response.put("message", "Student ID " + studentId + " is available for registration");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/name")
    public ResponseEntity<Map<String, Object>> checkNameDuplicate(
            @RequestParam String name,
            @RequestParam(required = false) String studentId) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Check if same name AND same ID exists (case insensitive)
        if (studentId != null && !studentId.trim().isEmpty()) {
            // Check in regular students
            boolean regularExists = studentRepository.existsByNameAndStudentId(name, studentId);
            if (regularExists) {
                response.put("exists", true);
                response.put("type", "REGULAR_STUDENT");
                response.put("message", "Student '" + name + "' with ID '" + studentId + "' already registered as regular student");
                return ResponseEntity.ok(response);
            }
            
            // Check in adult students
            boolean adultExists = adultStudentRepository.existsByNameAndStudentId(name, studentId);
            if (adultExists) {
                response.put("exists", true);
                response.put("type", "ADULT_STUDENT");
                response.put("message", "Student '" + name + "' with ID '" + studentId + "' already registered as adult student");
                return ResponseEntity.ok(response);
            }
            
            // Check in men's list
            boolean menExists = menStudentRepository.existsByNameAndStudentId(name, studentId);
            if (menExists) {
                response.put("exists", true);
                response.put("type", "MEN_STUDENT");
                response.put("message", "Student '" + name + "' with ID '" + studentId + "' already registered in men's list");
                return ResponseEntity.ok(response);
            }
        }
        
        response.put("exists", false);
        response.put("message", "Name " + name + " is available for registration");
        return ResponseEntity.ok(response);
    }
}