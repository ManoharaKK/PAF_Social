package com.gym.auth.repository;

import com.gym.auth.model.ProgressHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressHistoryRepository extends JpaRepository<ProgressHistory, Long> {
    List<ProgressHistory> findByProgressId(Long progressId);
    List<ProgressHistory> findByProgressIdOrderByRecordedAtDesc(Long progressId);
} 