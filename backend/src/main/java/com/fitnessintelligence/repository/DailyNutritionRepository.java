package com.fitnessintelligence.repository;

import com.fitnessintelligence.model.DailyNutritionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyNutritionRepository extends JpaRepository<DailyNutritionEntity, Long> {
    List<DailyNutritionEntity> findByUserIdOrderByLogDateDesc(Long userId);
    Optional<DailyNutritionEntity> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}
