package com.fitnessintelligence;

import com.fitnessintelligence.model.UserEntity;
import com.fitnessintelligence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindSeededUserByEmail() {
        Optional<UserEntity> user = userRepository.findByEmail("alex.morgan@demo.fitness");
        assertTrue(user.isPresent());
        assertEquals("Alex Morgan", user.get().getName());
        assertEquals(28, user.get().getAge());
        assertEquals("build_muscle", user.get().getGoal());
    }

    @Test
    void shouldCheckUserExistsByEmail() {
        boolean exists = userRepository.existsByEmail("alex.morgan@demo.fitness");
        assertTrue(exists);

        boolean nonExistent = userRepository.existsByEmail("unknown@nowhere.com");
        assertFalse(nonExistent);
    }
}
