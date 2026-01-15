package com.issa.javahmz.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "adult_students")
public class AdultStudent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String gender;
    
    @Column(name = "date_joined", nullable = false)
    private LocalDate dateJoined;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private String cell;
    
    @Column(name = "ustadh", nullable = false)
    private String ustadh;
    
    @Column(name = "class_teaching", nullable = false)
    private String classTeaching;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public AdultStudent() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Parameterized constructor
    public AdultStudent(String studentId, String name, String gender, LocalDate dateJoined, 
                       String location, String cell, String ustadh, String classTeaching) {
        this.studentId = studentId;
        this.name = name;
        this.gender = gender;
        this.dateJoined = dateJoined;
        this.location = location;
        this.cell = cell;
        this.ustadh = ustadh;
        this.classTeaching = classTeaching;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDate getDateJoined() {
        return dateJoined;
    }
    
    public void setDateJoined(LocalDate dateJoined) {
        this.dateJoined = dateJoined;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getCell() {
        return cell;
    }
    
    public void setCell(String cell) {
        this.cell = cell;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getUstadh() {
        return ustadh;
    }
    
    public void setUstadh(String ustadh) {
        this.ustadh = ustadh;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getClassTeaching() {
        return classTeaching;
    }
    
    public void setClassTeaching(String classTeaching) {
        this.classTeaching = classTeaching;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
