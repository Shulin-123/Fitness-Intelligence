package com.fitnessintelligence.controller;

import com.fitnessintelligence.dto.UserDto;
import com.fitnessintelligence.service.FitnessDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final FitnessDataService fitnessDataService;

    public UserController(FitnessDataService fitnessDataService) {
        this.fitnessDataService = fitnessDataService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(fitnessDataService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return fitnessDataService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lookup")
    public ResponseEntity<UserDto> getUserByEmail(@RequestParam String email) {
        return fitnessDataService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDto> syncUser(@RequestBody UserDto userDto) {
        UserDto saved = fitnessDataService.syncUser(userDto);
        return ResponseEntity.ok(saved);
    }
}
