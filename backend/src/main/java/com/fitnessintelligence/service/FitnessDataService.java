package com.fitnessintelligence.service;

import com.fitnessintelligence.dto.*;
import com.fitnessintelligence.model.*;
import com.fitnessintelligence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FitnessDataService {

    private final UserRepository userRepository;
    private final WorkoutSessionRepository workoutRepository;
    private final ExerciseLogRepository exerciseRepository;
    private final DailyNutritionRepository nutritionRepository;
    private final ReadinessCheckinRepository readinessRepository;

    public FitnessDataService(
            UserRepository userRepository,
            WorkoutSessionRepository workoutRepository,
            ExerciseLogRepository exerciseRepository,
            DailyNutritionRepository nutritionRepository,
            ReadinessCheckinRepository readinessRepository
    ) {
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
        this.nutritionRepository = nutritionRepository;
        this.readinessRepository = readinessRepository;
    }

    // ==========================================
    // USER PROFILE METHODS
    // ==========================================

    public UserDto syncUser(UserDto dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            dto.setEmail("demo.athlete@fitness.ai");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            dto.setName("Athlete");
        }

        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseGet(() -> new UserEntity(dto.getEmail(), dto.getName(), dto.getAge(), dto.getSex(),
                        dto.getHeightCm(), dto.getWeightKg(), dto.getGoal()));

        user.setName(dto.getName());
        user.setAge(dto.getAge());
        user.setSex(dto.getSex());
        user.setHeightCm(dto.getHeightCm());
        user.setWeightKg(dto.getWeightKg());
        user.setGoal(dto.getGoal());
        user.setExperience(dto.getExperience());
        user.setTrainingDaysPerWeek(dto.getTrainingDaysPerWeek());
        user.setSessionDurationMin(dto.getSessionDurationMin());
        user.setActivityLevel(dto.getActivityLevel());
        user.setDietPreference(dto.getDietPreference());

        UserEntity saved = userRepository.save(user);
        return toUserDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::toUserDto);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toUserDto);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserDto).collect(Collectors.toList());
    }

    // ==========================================
    // WORKOUT SESSION METHODS
    // ==========================================

    public WorkoutDto logWorkout(WorkoutDto dto) {
        UserEntity user = resolveUser(dto.getUserId());

        WorkoutSessionEntity session = new WorkoutSessionEntity(
                user,
                dto.getSessionDate() != null ? dto.getSessionDate() : LocalDate.now(),
                dto.getSplitName() != null ? dto.getSplitName() : "Dynamic Session",
                dto.getDurationMinutes() > 0 ? dto.getDurationMinutes() : 45,
                dto.getOverallRpe() > 0 ? dto.getOverallRpe() : 8.0
        );
        session.setNotes(dto.getNotes());
        session.setCompleted(dto.isCompleted());

        if (dto.getExercises() != null) {
            for (ExerciseDto exDto : dto.getExercises()) {
                ExerciseLogEntity exercise = new ExerciseLogEntity(
                        exDto.getExerciseName(),
                        exDto.getSetsCompleted(),
                        exDto.getRepsCompleted(),
                        exDto.getWeightKg(),
                        exDto.getTargetRir()
                );
                exercise.setNotes(exDto.getNotes());
                session.addExercise(exercise);
            }
        }

        WorkoutSessionEntity saved = workoutRepository.save(session);
        return toWorkoutDto(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkoutDto> getWorkoutsForUser(Long userId) {
        List<WorkoutSessionEntity> sessions;
        if (userId != null) {
            sessions = workoutRepository.findByUserIdOrderBySessionDateDesc(userId);
        } else {
            sessions = workoutRepository.findAll();
        }
        return sessions.stream().map(this::toWorkoutDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<WorkoutDto> getWorkoutById(Long id) {
        return workoutRepository.findById(id).map(this::toWorkoutDto);
    }

    // ==========================================
    // DAILY NUTRITION METHODS
    // ==========================================

    public DailyNutritionDto logNutrition(DailyNutritionDto dto) {
        UserEntity user = resolveUser(dto.getUserId());
        LocalDate date = dto.getLogDate() != null ? dto.getLogDate() : LocalDate.now();

        DailyNutritionEntity entity = nutritionRepository.findByUserIdAndLogDate(user.getId(), date)
                .orElseGet(() -> new DailyNutritionEntity(user, date, dto.getCalories(), dto.getProteinGrams(),
                        dto.getCarbsGrams(), dto.getFatsGrams(), dto.getWaterMl()));

        entity.setCalories(dto.getCalories());
        entity.setProteinGrams(dto.getProteinGrams());
        entity.setCarbsGrams(dto.getCarbsGrams());
        entity.setFatsGrams(dto.getFatsGrams());
        entity.setWaterMl(dto.getWaterMl());

        DailyNutritionEntity saved = nutritionRepository.save(entity);
        return toNutritionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DailyNutritionDto> getNutritionForUser(Long userId) {
        List<DailyNutritionEntity> logs;
        if (userId != null) {
            logs = nutritionRepository.findByUserIdOrderByLogDateDesc(userId);
        } else {
            logs = nutritionRepository.findAll();
        }
        return logs.stream().map(this::toNutritionDto).collect(Collectors.toList());
    }

    // ==========================================
    // READINESS CHECKIN METHODS
    // ==========================================

    public ReadinessDto logReadiness(ReadinessDto dto) {
        UserEntity user = resolveUser(dto.getUserId());
        LocalDate date = dto.getCheckinDate() != null ? dto.getCheckinDate() : LocalDate.now();

        // Calculate evidence-based autonomic readiness score (0-100)
        int sleep = Math.max(1, Math.min(10, dto.getSleepQuality()));
        int soreness = Math.max(1, Math.min(10, dto.getMuscleSoreness()));
        int stress = Math.max(1, Math.min(10, dto.getStressLevel()));
        int energy = Math.max(1, Math.min(10, dto.getEnergyLevel()));

        int calculatedScore = (int) Math.round(
                (sleep * 10 * 0.35) +
                ((11 - soreness) * 10 * 0.25) +
                ((11 - stress) * 10 * 0.20) +
                (energy * 10 * 0.20)
        );
        calculatedScore = Math.max(0, Math.min(100, calculatedScore));

        String recommendation;
        if (calculatedScore >= 80) {
            recommendation = "Optimal CNS readiness. Prime condition for heavy compound lifts & personal best attempts.";
        } else if (calculatedScore >= 60) {
            recommendation = "Moderate autonomic readiness. Recommended: Standard hypertrophy volume with 1-2 RIR.";
        } else {
            recommendation = "High fatigue state detected. Recommended: Active recovery, mobility work, or 50% deload intensity.";
        }

        final int finalScore = calculatedScore;
        final String finalRec = recommendation;

        ReadinessCheckinEntity entity = readinessRepository.findByUserIdAndCheckinDate(user.getId(), date)
                .orElseGet(() -> new ReadinessCheckinEntity(user, date, sleep, soreness, stress, energy, finalScore, finalRec));

        entity.setSleepQuality(sleep);
        entity.setMuscleSoreness(soreness);
        entity.setStressLevel(stress);
        entity.setEnergyLevel(energy);
        entity.setReadinessScore(finalScore);
        entity.setRecommendation(finalRec);

        ReadinessCheckinEntity saved = readinessRepository.save(entity);
        return toReadinessDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReadinessDto> getReadinessForUser(Long userId) {
        List<ReadinessCheckinEntity> list;
        if (userId != null) {
            list = readinessRepository.findByUserIdOrderByCheckinDateDesc(userId);
        } else {
            list = readinessRepository.findAll();
        }
        return list.stream().map(this::toReadinessDto).collect(Collectors.toList());
    }

    // ==========================================
    // HELPER MAPPERS
    // ==========================================

    private UserEntity resolveUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId).orElseGet(() -> getOrCreateDefaultUser());
        }
        return getOrCreateDefaultUser();
    }

    private UserEntity getOrCreateDefaultUser() {
        return userRepository.findAll().stream().findFirst().orElseGet(() -> {
            UserEntity user = new UserEntity("alex.morgan@demo.fitness", "Alex Morgan", 28, "male", 178.0, 74.5, "build_muscle");
            return userRepository.save(user);
        });
    }

    public UserDto toUserDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getEmail(),
                entity.getName(),
                entity.getAge(),
                entity.getSex(),
                entity.getHeightCm(),
                entity.getWeightKg(),
                entity.getGoal(),
                entity.getExperience(),
                entity.getTrainingDaysPerWeek(),
                entity.getSessionDurationMin(),
                entity.getActivityLevel(),
                entity.getDietPreference()
        );
    }

    public WorkoutDto toWorkoutDto(WorkoutSessionEntity entity) {
        List<ExerciseDto> exerciseDtos = entity.getExercises().stream()
                .map(e -> new ExerciseDto(
                        e.getId(),
                        e.getExerciseName(),
                        e.getSetsCompleted(),
                        e.getRepsCompleted(),
                        e.getWeightKg(),
                        e.getTargetRir(),
                        e.getEstimated1Rm(),
                        e.getNotes()
                ))
                .collect(Collectors.toList());

        return new WorkoutDto(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getSessionDate(),
                entity.getSplitName(),
                entity.getDurationMinutes(),
                entity.getOverallRpe(),
                entity.getNotes(),
                entity.isCompleted(),
                exerciseDtos
        );
    }

    public DailyNutritionDto toNutritionDto(DailyNutritionEntity entity) {
        return new DailyNutritionDto(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getLogDate(),
                entity.getCalories(),
                entity.getProteinGrams(),
                entity.getCarbsGrams(),
                entity.getFatsGrams(),
                entity.getWaterMl()
        );
    }

    public ReadinessDto toReadinessDto(ReadinessCheckinEntity entity) {
        return new ReadinessDto(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getCheckinDate(),
                entity.getSleepQuality(),
                entity.getMuscleSoreness(),
                entity.getStressLevel(),
                entity.getEnergyLevel(),
                entity.getReadinessScore(),
                entity.getRecommendation()
        );
    }
}
