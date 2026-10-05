package com.fitnessintelligence.repository;

import com.fitnessintelligence.model.ReadinessCheckinEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReadinessCheckinRepository extends JpaRepository<ReadinessCheckinEntity, Long> {
    List<ReadinessCheckinEntity> findByUserIdOrderByCheckinDateDesc(Long userId);
    Optional<ReadinessCheckinEntity> findByUserIdAndCheckinDate(Long userId, LocalDate checkinDate);
}
