package com.issa.javahmz.service;

import com.issa.javahmz.entity.Teacher;
import com.issa.javahmz.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    // Get all teachers
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAllByOrderByNameAsc();
    }
    
    // Get teacher by ID
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }
    
    // Get teacher by name and class
    public Optional<Teacher> getTeacherByNameAndClass(String name, String classTeaching) {
        return teacherRepository.findByNameAndClassTeaching(name, classTeaching);
    }
    
    // Create new teacher
    public Teacher createTeacher(Teacher teacher) {
        // Check if teacher with same name already exists
        if (teacherRepository.existsByName(teacher.getName())) {
            throw new RuntimeException("Teacher with name '" + teacher.getName() + "' already exists");
        }
        return teacherRepository.save(teacher);
    }
    
    // Update teacher
    public Teacher updateTeacher(Long id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!teacher.getName().equals(teacherDetails.getName()) && 
            teacherRepository.existsByName(teacherDetails.getName())) {
            throw new RuntimeException("Teacher with name '" + teacherDetails.getName() + "' already exists");
        }
        
        teacher.setName(teacherDetails.getName());
        teacher.setClassTeaching(teacherDetails.getClassTeaching());
        
        return teacherRepository.save(teacher);
    }
    
    // Delete teacher
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
        teacherRepository.delete(teacher);
    }
    
    // Search teachers by name
    public List<Teacher> searchTeachers(String name) {
        return teacherRepository.searchByName(name);
    }
}