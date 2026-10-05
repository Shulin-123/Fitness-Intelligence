package com.fitnessintelligence.repository;

import com.fitnessintelligence.model.ExerciseLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseLogRepository extends JpaRepository<ExerciseLogEntity, Long> {
    List<ExerciseLogEntity> findByWorkoutSessionId(Long workoutSessionId);
}
