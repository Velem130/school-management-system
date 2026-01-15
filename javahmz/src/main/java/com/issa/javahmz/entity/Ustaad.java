package com.issa.javahmz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ustaads")
public class Ustaad {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(name = "class_teaching", nullable = false)
    private String classTeaching;
    
    @Column(nullable = false)
    private String center;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(name = "num_students", nullable = false)
    private Integer numStudents;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Ustaad() {
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
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getClassTeaching() {
        return classTeaching;
    }
    
    public void setClassTeaching(String classTeaching) {
        this.classTeaching = classTeaching;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getCenter() {
        return center;
    }
    
    public void setCenter(String center) {
        this.center = center;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getNumStudents() {
        return numStudents;
    }
    
    public void setNumStudents(Integer numStudents) {
        this.numStudents = numStudents;
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