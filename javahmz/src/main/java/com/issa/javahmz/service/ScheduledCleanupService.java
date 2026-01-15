package com.issa.javahmz.service;

import com.issa.javahmz.repository.ExcludedStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;    // ← Put it here
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ScheduledCleanupService {

    @Autowired
    private ExcludedStudentRepository excludedStudentRepository;

    // Runs every day at 3:00 AM
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldExcludedRecords() {
        LocalDate threeYearsAgo = LocalDate.now().minusYears(3);
        
        long count = excludedStudentRepository.deleteByExcludedDateBefore(threeYearsAgo);
        
        if (count > 0) {
            System.out.println("Automatically cleaned up " + count + 
                              " excluded student records older than 3 years");
        }
    }
}