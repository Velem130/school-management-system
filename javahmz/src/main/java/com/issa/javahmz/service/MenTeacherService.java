package com.issa.javahmz.service;

import com.issa.javahmz.entity.MenTeacher;
import com.issa.javahmz.repository.MenTeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenTeacherService {
    
    @Autowired
    private MenTeacherRepository menTeacherRepository;
    
    // Get all men teachers
    public List<MenTeacher> getAllMenTeachers() {
        return menTeacherRepository.findAllByOrderByNameAsc();
    }
    
    // Get men teacher by ID
    public Optional<MenTeacher> getMenTeacherById(Long id) {
        return menTeacherRepository.findById(id);
    }
    
    // Get men teacher by name and class
    public Optional<MenTeacher> getMenTeacherByNameAndClass(String name, String classTeaching) {
        return menTeacherRepository.findByNameAndClassTeaching(name, classTeaching);
    }
    
    // Create new men teacher
    public MenTeacher createMenTeacher(MenTeacher menTeacher) {
        // Check if men teacher with same name already exists
        if (menTeacherRepository.existsByName(menTeacher.getName())) {
            throw new RuntimeException("Men teacher with name '" + menTeacher.getName() + "' already exists");
        }
        return menTeacherRepository.save(menTeacher);
    }
    
    // Update men teacher
    public MenTeacher updateMenTeacher(Long id, MenTeacher menTeacherDetails) {
        MenTeacher menTeacher = menTeacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Men teacher not found with id: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!menTeacher.getName().equals(menTeacherDetails.getName()) && 
            menTeacherRepository.existsByName(menTeacherDetails.getName())) {
            throw new RuntimeException("Men teacher with name '" + menTeacherDetails.getName() + "' already exists");
        }
        
        menTeacher.setName(menTeacherDetails.getName());
        menTeacher.setClassTeaching(menTeacherDetails.getClassTeaching());
        
        return menTeacherRepository.save(menTeacher);
    }
    
    // Delete men teacher
    public void deleteMenTeacher(Long id) {
        MenTeacher menTeacher = menTeacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Men teacher not found with id: " + id));
        menTeacherRepository.delete(menTeacher);
    }
    
    // Search men teachers by name
    public List<MenTeacher> searchMenTeachers(String name) {
        return menTeacherRepository.searchByName(name);
    }
}
