package com.issa.javahmz.service;

import com.issa.javahmz.entity.AdultStudent;
import com.issa.javahmz.repository.AdultStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdultStudentService {
    
    @Autowired
    private AdultStudentRepository adultStudentRepository;
    
    // Get all adult students
    public List<AdultStudent> getAllAdultStudents() {
        return adultStudentRepository.findAllByOrderByNameAsc();
    }
    
    // Get adult student by ID
    public Optional<AdultStudent> getAdultStudentById(Long id) {
        return adultStudentRepository.findById(id);
    }
    
    // Get adult student by student ID
    public Optional<AdultStudent> getAdultStudentByStudentId(String studentId) {
        return adultStudentRepository.findByStudentId(studentId);
    }
    
    // Get adult students by teacher name
    public List<AdultStudent> getAdultStudentsByTeacher(String ustadh) {
        return adultStudentRepository.findByUstadh(ustadh);
    }
    
    // Get adult students by teacher name and class
    public List<AdultStudent> getAdultStudentsByTeacherAndClass(String ustadh, String classTeaching) {
        return adultStudentRepository.findByUstadhAndClassTeaching(ustadh, classTeaching);
    }
    
    // Create new adult student
    public AdultStudent createAdultStudent(AdultStudent adultStudent) {
        // Check if adult student with same ID already exists
        if (adultStudentRepository.existsByStudentId(adultStudent.getStudentId())) {
            throw new RuntimeException("Adult student with ID '" + adultStudent.getStudentId() + "' already exists");
        }
        
        // Check if adult student with same name AND ID already exists
        if (adultStudentRepository.existsByNameAndStudentId(adultStudent.getName(), adultStudent.getStudentId())) {
            throw new RuntimeException("Adult student '" + adultStudent.getName() + "' with ID '" + adultStudent.getStudentId() + "' already exists");
        }
        
        return adultStudentRepository.save(adultStudent);
    }
    
    // Update adult student
    public AdultStudent updateAdultStudent(Long id, AdultStudent adultStudentDetails) {
        AdultStudent adultStudent = adultStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adult student not found with id: " + id));
        
        // Check if student ID is being changed and if new ID already exists
        if (!adultStudent.getStudentId().equals(adultStudentDetails.getStudentId()) && 
            adultStudentRepository.existsByStudentId(adultStudentDetails.getStudentId())) {
            throw new RuntimeException("Adult student with ID '" + adultStudentDetails.getStudentId() + "' already exists");
        }
        
        adultStudent.setStudentId(adultStudentDetails.getStudentId());
        adultStudent.setName(adultStudentDetails.getName());
        adultStudent.setGender(adultStudentDetails.getGender());
        adultStudent.setDateJoined(adultStudentDetails.getDateJoined());
        adultStudent.setLocation(adultStudentDetails.getLocation());
        adultStudent.setCell(adultStudentDetails.getCell());
        adultStudent.setUstadh(adultStudentDetails.getUstadh());
        adultStudent.setClassTeaching(adultStudentDetails.getClassTeaching());
        
        return adultStudentRepository.save(adultStudent);
    }
    
    // Delete adult student
    public void deleteAdultStudent(Long id) {
        AdultStudent adultStudent = adultStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adult student not found with id: " + id));
        adultStudentRepository.delete(adultStudent);
    }
    
    // Delete all adult students by teacher
    public void deleteAdultStudentsByTeacher(String ustadh) {
        List<AdultStudent> adultStudents = adultStudentRepository.findByUstadh(ustadh);
        adultStudentRepository.deleteAll(adultStudents);
    }
    
    // Count adult students by teacher
    public Long countAdultStudentsByTeacher(String ustadh) {
        return adultStudentRepository.countByUstadh(ustadh);
    }
    
    // Search adult students
    public List<AdultStudent> searchAdultStudents(String searchTerm) {
        return adultStudentRepository.searchByNameOrId(searchTerm);
    }
}