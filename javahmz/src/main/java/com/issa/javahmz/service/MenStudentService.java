package com.issa.javahmz.service;

import com.issa.javahmz.entity.MenStudent;
import com.issa.javahmz.repository.MenStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenStudentService {
    
    @Autowired
    private MenStudentRepository menStudentRepository;
    
    // Get all men students
    public List<MenStudent> getAllMenStudents() {
        return menStudentRepository.findAllByOrderByNameAsc();
    }
    
    // Get men student by ID
    public Optional<MenStudent> getMenStudentById(Long id) {
        return menStudentRepository.findById(id);
    }
    
    // Get men student by student ID
    public Optional<MenStudent> getMenStudentByStudentId(String studentId) {
        return menStudentRepository.findByStudentId(studentId);
    }
    
    // Get men students by teacher name
    public List<MenStudent> getMenStudentsByTeacher(String ustadh) {
        return menStudentRepository.findByUstadh(ustadh);
    }
    
    // Get men students by teacher name and class
    public List<MenStudent> getMenStudentsByTeacherAndClass(String ustadh, String classTeaching) {
        return menStudentRepository.findByUstadhAndClassTeaching(ustadh, classTeaching);
    }
    
    // Create new men student
    public MenStudent createMenStudent(MenStudent menStudent) {
        // Check if men student with same ID already exists
        if (menStudentRepository.existsByStudentId(menStudent.getStudentId())) {
            throw new RuntimeException("Men student with ID '" + menStudent.getStudentId() + "' already exists");
        }
        
        // Check if men student with same name AND ID already exists
        if (menStudentRepository.existsByNameAndStudentId(menStudent.getName(), menStudent.getStudentId())) {
            throw new RuntimeException("Men student '" + menStudent.getName() + "' with ID '" + menStudent.getStudentId() + "' already exists");
        }
        
        return menStudentRepository.save(menStudent);
    }
    
    // Update men student
    public MenStudent updateMenStudent(Long id, MenStudent menStudentDetails) {
        MenStudent menStudent = menStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Men student not found with id: " + id));
        
        // Check if student ID is being changed and if new ID already exists
        if (!menStudent.getStudentId().equals(menStudentDetails.getStudentId()) && 
            menStudentRepository.existsByStudentId(menStudentDetails.getStudentId())) {
            throw new RuntimeException("Men student with ID '" + menStudentDetails.getStudentId() + "' already exists");
        }
        
        menStudent.setStudentId(menStudentDetails.getStudentId());
        menStudent.setName(menStudentDetails.getName());
        menStudent.setGender(menStudentDetails.getGender());
        menStudent.setDateJoined(menStudentDetails.getDateJoined());
        menStudent.setLocation(menStudentDetails.getLocation());
        menStudent.setCell(menStudentDetails.getCell());
        menStudent.setUstadh(menStudentDetails.getUstadh());
        menStudent.setClassTeaching(menStudentDetails.getClassTeaching());
        
        return menStudentRepository.save(menStudent);
    }
    
    // Delete men student
    public void deleteMenStudent(Long id) {
        MenStudent menStudent = menStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Men student not found with id: " + id));
        menStudentRepository.delete(menStudent);
    }
    
    // Delete all men students by teacher
    public void deleteMenStudentsByTeacher(String ustadh) {
        List<MenStudent> menStudents = menStudentRepository.findByUstadh(ustadh);
        menStudentRepository.deleteAll(menStudents);
    }
    
    // Count men students by teacher
    public Long countMenStudentsByTeacher(String ustadh) {
        return menStudentRepository.countByUstadh(ustadh);
    }
    
    // Search men students
    public List<MenStudent> searchMenStudents(String searchTerm) {
        return menStudentRepository.searchByNameOrId(searchTerm);
    }
}
