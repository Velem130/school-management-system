package com.issa.javahmz.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "excluded_students")
public class ExcludedStudent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Original student information
    @Column(name = "student_id", nullable = false)
    private String studentId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String gender;
    
    @Column(name = "date_joined", nullable = false)
    private LocalDate dateJoined;
    
    @Column(nullable = false)
    private String location;
    
    @Column(name = "madrassa_location", nullable = false)
    private String madrassaLocation;
    
    @Column(name = "shoe_size")
    private String shoeSize;
    
    @Column(nullable = false)
    private String cell;
    
    @Column(name = "ustadh", nullable = false)
    private String ustadh;
    
    @Column(name = "class_teaching", nullable = false)
    private String classTeaching;
    
    // Exclusion information
    @Column(name = "excluded_date", nullable = false)
    private LocalDate excludedDate;
    
    @Column(name = "excluded_by", nullable = false)
    private String excludedBy;
    
    @Column(nullable = false)
    private String reason;
    
    @Column(name = "exclusion_type", nullable = false)
    private String exclusionType;
    
    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Default constructor
    public ExcludedStudent() {
        this.createdAt = LocalDateTime.now();
        this.excludedDate = LocalDate.now();
    }
    
    // Constructor from Student entity
    public ExcludedStudent(Student student, String excludedBy, String reason, 
                          String exclusionType, String additionalNotes) {
        this.studentId = student.getStudentId();
        this.name = student.getName();
        this.gender = student.getGender();
        this.dateJoined = student.getDateJoined();
        this.location = student.getLocation();
        this.madrassaLocation = student.getMadrassaLocation();
        this.shoeSize = student.getShoeSize();
        this.cell = student.getCell();
        this.ustadh = student.getUstadh();
        this.classTeaching = student.getClassTeaching();
        
        this.excludedBy = excludedBy;
        this.reason = reason;
        this.exclusionType = exclusionType;
        this.additionalNotes = additionalNotes;
        this.excludedDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
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
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public LocalDate getDateJoined() {
        return dateJoined;
    }
    
    public void setDateJoined(LocalDate dateJoined) {
        this.dateJoined = dateJoined;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getMadrassaLocation() {
        return madrassaLocation;
    }
    
    public void setMadrassaLocation(String madrassaLocation) {
        this.madrassaLocation = madrassaLocation;
    }
    
    public String getShoeSize() {
        return shoeSize;
    }
    
    public void setShoeSize(String shoeSize) {
        this.shoeSize = shoeSize;
    }
    
    public String getCell() {
        return cell;
    }
    
    public void setCell(String cell) {
        this.cell = cell;
    }
    
    public String getUstadh() {
        return ustadh;
    }
    
    public void setUstadh(String ustadh) {
        this.ustadh = ustadh;
    }
    
    public String getClassTeaching() {
        return classTeaching;
    }
    
    public void setClassTeaching(String classTeaching) {
        this.classTeaching = classTeaching;
    }
    
    public LocalDate getExcludedDate() {
        return excludedDate;
    }
    
    public void setExcludedDate(LocalDate excludedDate) {
        this.excludedDate = excludedDate;
    }
    
    public String getExcludedBy() {
        return excludedBy;
    }
    
    public void setExcludedBy(String excludedBy) {
        this.excludedBy = excludedBy;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getExclusionType() {
        return exclusionType;
    }
    
    public void setExclusionType(String exclusionType) {
        this.exclusionType = exclusionType;
    }
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
