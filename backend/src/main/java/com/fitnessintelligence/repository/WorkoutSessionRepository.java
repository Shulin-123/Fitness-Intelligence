package com.fitnessintelligence.repository;

import com.fitnessintelligence.model.WorkoutSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSessionEntity, Long> {
    List<WorkoutSessionEntity> findByUserIdOrderBySessionDateDesc(Long userId);
}
