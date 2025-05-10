package com.gym.auth.repository;

import com.gym.auth.model.User;
import com.gym.auth.model.WorkoutSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutScheduleRepository extends JpaRepository<WorkoutSchedule, Long> {
    
    /**
     * Find all workout schedules for a specific user
     * 
     * @param user The user to find workout schedules for
     * @return List of workout schedules
     */
    List<WorkoutSchedule> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find all workout schedules for a specific user and containing a specific day
     * 
     * @param user The user to find workout schedules for
     * @param day The day to filter by (e.g., "Monday", "Tuesday", etc.)
     * @return List of workout schedules
     */
    List<WorkoutSchedule> findByUserAndDaysContainingOrderByCreatedAtDesc(User user, String day);
    
    /**
     * Check if a workout schedule exists and belongs to a specific user
     * 
     * @param id The workout schedule ID
     * @param user The user to check ownership for
     * @return true if the workout schedule exists and belongs to the user
     */
    boolean existsByIdAndUser(Long id, User user);
}
