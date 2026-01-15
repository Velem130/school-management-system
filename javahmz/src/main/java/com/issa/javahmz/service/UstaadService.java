package com.issa.javahmz.service;

import com.issa.javahmz.entity.Ustaad;
import com.issa.javahmz.repository.UstaadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UstaadService {
    
    @Autowired
    private UstaadRepository ustaadRepository;
    
    // Get all ustaads
    public List<Ustaad> getAllUstaads() {
        return ustaadRepository.findAllByOrderByFullNameAsc();
    }
    
    // Get ustaad by ID
    public Optional<Ustaad> getUstaadById(Long id) {
        return ustaadRepository.findById(id);
    }
    
    // Create new ustaad
    public Ustaad createUstaad(Ustaad ustaad) {
        // Check if ustaad with same name already exists
        if (ustaadRepository.existsByFullName(ustaad.getFullName())) {
            throw new RuntimeException("Ustaad with name '" + ustaad.getFullName() + "' already exists");
        }
        return ustaadRepository.save(ustaad);
    }
    
    // Update ustaad
    public Ustaad updateUstaad(Long id, Ustaad ustaadDetails) {
        Ustaad ustaad = ustaadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ustaad not found with id: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!ustaad.getFullName().equals(ustaadDetails.getFullName()) && 
            ustaadRepository.existsByFullName(ustaadDetails.getFullName())) {
            throw new RuntimeException("Ustaad with name '" + ustaadDetails.getFullName() + "' already exists");
        }
        
        ustaad.setFullName(ustaadDetails.getFullName());
        ustaad.setClassTeaching(ustaadDetails.getClassTeaching());
        ustaad.setCenter(ustaadDetails.getCenter());
        ustaad.setPhone(ustaadDetails.getPhone());
        ustaad.setNumStudents(ustaadDetails.getNumStudents());
        
        return ustaadRepository.save(ustaad);
    }
    
    // Delete ustaad
    public void deleteUstaad(Long id) {
        Ustaad ustaad = ustaadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ustaad not found with id: " + id));
        ustaadRepository.delete(ustaad);
    }
    
    // Search ustaads by name
    public List<Ustaad> searchUstaads(String name) {
        return ustaadRepository.searchByFullName(name);
    }
}
