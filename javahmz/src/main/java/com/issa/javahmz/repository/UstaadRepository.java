package com.issa.javahmz.repository;

import com.issa.javahmz.entity.Ustaad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UstaadRepository extends JpaRepository<Ustaad, Long> {
    
    // Find ustaad by full name
    Optional<Ustaad> findByFullName(String fullName);
    
    // Check if ustaad exists by full name
    boolean existsByFullName(String fullName);
    
    // Find all ustaads ordered by full name
    List<Ustaad> findAllByOrderByFullNameAsc();
    
    // Search ustaads by name (case-insensitive)
    @Query("SELECT u FROM Ustaad u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Ustaad> searchByFullName(@Param("name") String name);
}