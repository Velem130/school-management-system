package com.issa.javahmz.controller;

import com.issa.javahmz.entity.Ustaad;
import com.issa.javahmz.service.UstaadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ustaads")
public class UstaadController {
    
    @Autowired
    private UstaadService ustaadService;
    
    // Get all ustaads
    @GetMapping
    public ResponseEntity<List<Ustaad>> getAllUstaads() {
        List<Ustaad> ustaads = ustaadService.getAllUstaads();
        return ResponseEntity.ok(ustaads);
    }
    
    // Get ustaad by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUstaadById(@PathVariable Long id) {
        Optional<Ustaad> ustaad = ustaadService.getUstaadById(id);
        if (ustaad.isPresent()) {
            return ResponseEntity.ok(ustaad.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Ustaad not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Create new ustaad
    @PostMapping
    public ResponseEntity<?> createUstaad(@RequestBody Ustaad ustaad) {
        try {
            Ustaad createdUstaad = ustaadService.createUstaad(ustaad);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUstaad);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // Update ustaad
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUstaad(@PathVariable Long id, @RequestBody Ustaad ustaadDetails) {
        try {
            Ustaad updatedUstaad = ustaadService.updateUstaad(id, ustaadDetails);
            return ResponseEntity.ok(updatedUstaad);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Delete ustaad
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUstaad(@PathVariable Long id) {
        try {
            ustaadService.deleteUstaad(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Ustaad deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Search ustaads by name
    @GetMapping("/search")
    public ResponseEntity<List<Ustaad>> searchUstaads(@RequestParam String name) {
        List<Ustaad> ustaads = ustaadService.searchUstaads(name);
        return ResponseEntity.ok(ustaads);
    }
}
