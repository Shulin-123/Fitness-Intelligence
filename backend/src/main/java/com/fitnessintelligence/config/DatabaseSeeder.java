package com.fitnessintelligence.config;

import com.fitnessintelligence.model.*;
import com.fitnessintelligence.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DatabaseSeeder {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Bean
    public CommandLineRunner seedDatabase(
            UserRepository userRepository,
            WorkoutSessionRepository workoutRepo,
            DailyNutritionRepository nutritionRepo,
            ReadinessCheckinRepository readinessRepo
    ) {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Seeding initial Demo User (Alex Morgan) into H2 database...");

                // 1. Seed User
                UserEntity alex = new UserEntity(
                        "alex.morgan@demo.fitness",
                        "Alex Morgan",
                        28,
                        "male",
                        178.0,
                        74.5,
                        "build_muscle"
                );
                alex.setExperience("intermediate");
                alex.setTrainingDaysPerWeek(4);
                alex.setSessionDurationMin(60);
                alex.setActivityLevel("moderate");
                alex.setDietPreference("non_veg");
                userRepository.save(alex);

                // 2. Seed Workout Sessions
                WorkoutSessionEntity pushDay = new WorkoutSessionEntity(
                        alex,
                        LocalDate.now().minusDays(1),
                        "Push Day A (Hypertrophy)",
                        55,
                        8.5
                );
                pushDay.setNotes("Hit clean pause at chest on all bench working sets. Zero elbow flare.");
                pushDay.addExercise(new ExerciseLogEntity("Barbell Bench Press", 4, 8, 82.5, 2));
                pushDay.addExercise(new ExerciseLogEntity("Incline Dumbbell Press", 3, 10, 28.0, 1));
                pushDay.addExercise(new ExerciseLogEntity("Cable Lateral Raise", 4, 15, 12.5, 1));
                pushDay.addExercise(new ExerciseLogEntity("Overhead Triceps Extension", 3, 12, 25.0, 2));
                workoutRepo.save(pushDay);

                WorkoutSessionEntity legDay = new WorkoutSessionEntity(
                        alex,
                        LocalDate.now().minusDays(3),
                        "Legs & Core (Power)",
                        60,
                        8.0
                );
                legDay.setNotes("Knee path tracked over 2nd toe smoothly throughout squat eccentric phase.");
                legDay.addExercise(new ExerciseLogEntity("Barbell Back Squat", 4, 6, 110.0, 2));
                legDay.addExercise(new ExerciseLogEntity("Romanian Deadlift", 3, 8, 100.0, 2));
                legDay.addExercise(new ExerciseLogEntity("Standing Calf Raise", 4, 12, 60.0, 1));
                workoutRepo.save(legDay);

                // 3. Seed Daily Nutrition
                DailyNutritionEntity todayNutrition = new DailyNutritionEntity(
                        alex,
                        LocalDate.now(),
                        2480,
                        168.0,
                        285.0,
                        68.0,
                        3400
                );
                nutritionRepo.save(todayNutrition);

                DailyNutritionEntity yesterdayNutrition = new DailyNutritionEntity(
                        alex,
                        LocalDate.now().minusDays(1),
                        2420,
                        162.0,
                        275.0,
                        70.0,
                        3100
                );
                nutritionRepo.save(yesterdayNutrition);

                // 4. Seed Readiness Checkin
                ReadinessCheckinEntity todayReadiness = new ReadinessCheckinEntity(
                        alex,
                        LocalDate.now(),
                        8,
                        3,
                        3,
                        8,
                        86,
                        "Excellent autonomic recovery. Ready for high-velocity compound training."
                );
                readinessRepo.save(todayReadiness);

                log.info("Database seeding complete: 1 user, 2 workouts, 2 nutrition logs, 1 readiness checkin ready in H2!");
            }
        };
    }
}
