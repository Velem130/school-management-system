package com.issa.javahmz.service;

import com.issa.javahmz.entity.Student;
import com.issa.javahmz.repository.StudentRepository;
import com.issa.javahmz.repository.ExcludedStudentRepository;  // This line must match your actual package
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExcludedStudentRepository excludedStudentRepository;  // Now it should resolve

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAllByOrderByNameAsc();
    }

    // Get student by ID
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    // Get student by student ID
    public Optional<Student> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    // Get students by teacher name
    public List<Student> getStudentsByTeacher(String ustadh) {
        return studentRepository.findByUstadh(ustadh);
    }

    // Get students by teacher name and class
    public List<Student> getStudentsByTeacherAndClass(String ustadh, String classTeaching) {
        return studentRepository.findByUstadhAndClassTeaching(ustadh, classTeaching);
    }

    // Create new student (with restore flag to allow same ID during restore)
    public Student createStudent(Student student, boolean isRestore) {
        String studentId = student.getStudentId();

        // Skip strict checks only when restoring from excluded
        if (!isRestore) {
            // Check active students
            if (studentRepository.existsByStudentId(studentId)) {
                throw new IllegalArgumentException("Student with ID '" + studentId + "' already exists in active students");
            }

            // Check excluded students - permanently block re-use
            if (excludedStudentRepository.existsByStudentId(studentId)) {
                throw new IllegalArgumentException(
                    "Student ID '" + studentId + "' was previously excluded and cannot be reused (permanently blocked)"
                );
            }
        }

        return studentRepository.save(student);
    }

    // Update student
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Check if student ID is being changed and if new ID already exists (active or excluded)
        String newStudentId = studentDetails.getStudentId();
        if (!student.getStudentId().equals(newStudentId)) {
            if (studentRepository.existsByStudentId(newStudentId)) {
                throw new IllegalArgumentException("Student with ID '" + newStudentId + "' already exists in active students");
            }
            if (excludedStudentRepository.existsByStudentId(newStudentId)) {
                throw new IllegalArgumentException("Cannot change to ID '" + newStudentId + "' - it was previously excluded");
            }
        }

        student.setStudentId(newStudentId);
        student.setName(studentDetails.getName());
        student.setGender(studentDetails.getGender());
        student.setDateJoined(studentDetails.getDateJoined());
        student.setLocation(studentDetails.getLocation());
        student.setMadrassaLocation(studentDetails.getMadrassaLocation());
        student.setShoeSize(studentDetails.getShoeSize());
        student.setCell(studentDetails.getCell());
        student.setUstadh(studentDetails.getUstadh());
        student.setClassTeaching(studentDetails.getClassTeaching());

        return studentRepository.save(student);
    }

    // Delete student
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }

    // Delete all students by teacher
    public void deleteStudentsByTeacher(String ustadh) {
        List<Student> students = studentRepository.findByUstadh(ustadh);
        studentRepository.deleteAll(students);
    }

    // Count students by teacher
    public Long countStudentsByTeacher(String ustadh) {
        return studentRepository.countByUstadh(ustadh);
    }

    // Search students
    public List<Student> searchStudents(String searchTerm) {
        return studentRepository.searchByNameOrId(searchTerm);
    }

    // Update classTeaching for all students of a specific teacher
    public void updateStudentsClass(String ustadh, String oldClassTeaching, String newClassTeaching) {
        List<Student> students = studentRepository.findByUstadhAndClassTeaching(ustadh, oldClassTeaching);
        for (Student student : students) {
            student.setClassTeaching(newClassTeaching);
            studentRepository.save(student);
        }
    }

    // Transfer student
    public Student transferStudent(Long id, String newUstadh, String newClassTeaching, String transferredBy, String notes) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        student.setUstadh(newUstadh);
        student.setClassTeaching(newClassTeaching);

        return studentRepository.save(student);
    }
}