package com.issa.javahmz.service;

import com.issa.javahmz.entity.AdultTeacher;
import com.issa.javahmz.repository.AdultTeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdultTeacherService {
    
    @Autowired
    private AdultTeacherRepository adultTeacherRepository;
    
    // Get all adult teachers
    public List<AdultTeacher> getAllAdultTeachers() {
        return adultTeacherRepository.findAllByOrderByNameAsc();
    }
    
    // Get adult teacher by ID
    public Optional<AdultTeacher> getAdultTeacherById(Long id) {
        return adultTeacherRepository.findById(id);
    }
    
    // Get adult teacher by name and class
    public Optional<AdultTeacher> getAdultTeacherByNameAndClass(String name, String classTeaching) {
        return adultTeacherRepository.findByNameAndClassTeaching(name, classTeaching);
    }
    
    // Create new adult teacher
    public AdultTeacher createAdultTeacher(AdultTeacher adultTeacher) {
        // Check if adult teacher with same name already exists
        if (adultTeacherRepository.existsByName(adultTeacher.getName())) {
            throw new RuntimeException("Adult teacher with name '" + adultTeacher.getName() + "' already exists");
        }
        return adultTeacherRepository.save(adultTeacher);
    }
    
    // Update adult teacher
    public AdultTeacher updateAdultTeacher(Long id, AdultTeacher adultTeacherDetails) {
        AdultTeacher adultTeacher = adultTeacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adult teacher not found with id: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!adultTeacher.getName().equals(adultTeacherDetails.getName()) && 
            adultTeacherRepository.existsByName(adultTeacherDetails.getName())) {
            throw new RuntimeException("Adult teacher with name '" + adultTeacherDetails.getName() + "' already exists");
        }
        
        adultTeacher.setName(adultTeacherDetails.getName());
        adultTeacher.setClassTeaching(adultTeacherDetails.getClassTeaching());
        
        return adultTeacherRepository.save(adultTeacher);
    }
    
    // Delete adult teacher
    public void deleteAdultTeacher(Long id) {
        AdultTeacher adultTeacher = adultTeacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adult teacher not found with id: " + id));
        adultTeacherRepository.delete(adultTeacher);
    }
    
    // Search adult teachers by name
    public List<AdultTeacher> searchAdultTeachers(String name) {
        return adultTeacherRepository.searchByName(name);
    }
}