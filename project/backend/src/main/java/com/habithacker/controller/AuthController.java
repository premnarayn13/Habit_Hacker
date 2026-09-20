package com.habithacker.controller;

import com.habithacker.entity.UserSettings;
import com.habithacker.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    // Helper method to hash password
    private String hashPassword(String rawPassword) {
        if (rawPassword == null) return "";
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(rawPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return "enc_" + rawPassword.hashCode();
        }
    }

    // POST /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String displayName = body.get("displayName");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required."));
        }

        String cleanEmail = email.trim().toLowerCase();
        String nameToUse = (displayName != null && !displayName.isBlank()) 
                ? displayName.trim() 
                : cleanEmail.split("@")[0];

        Optional<UserSettings> existingOpt = userSettingsRepository.findByUserId(cleanEmail);
        if (existingOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "An account with email " + cleanEmail + " is already registered. Please click 'Sign In' to log in."
            ));
        }

        UserSettings newSettings = new UserSettings("setting_" + UUID.randomUUID().toString(), cleanEmail, nameToUse, cleanEmail);
        if (password != null && !password.isBlank()) {
            newSettings.setPasswordHash(hashPassword(password));
        }
        newSettings.setCreatedAt(OffsetDateTime.now());
        newSettings.setUpdatedAt(OffsetDateTime.now());

        UserSettings saved = userSettingsRepository.save(newSettings);

        return ResponseEntity.ok(Map.of(
                "message", "Account registered successfully for " + cleanEmail,
                "user", Map.of(
                        "id", saved.getUserId(),
                        "email", saved.getEmail(),
                        "displayName", saved.getDisplayName()
                )
        ));
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required."));
        }

        String cleanEmail = email.trim().toLowerCase();

        Optional<UserSettings> existingOpt = userSettingsRepository.findByUserId(cleanEmail);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No registered account found for \"" + cleanEmail + "\". Please click the \"Register\" tab to create your account first."
            ));
        }

        UserSettings user = existingOpt.get();

        // Verify password if passwordHash exists
        if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank() && password != null && !password.isBlank()) {
            String incomingHash = hashPassword(password);
            if (!user.getPasswordHash().equals(incomingHash)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "Incorrect password for \"" + cleanEmail + "\". Please check your credentials and try again."
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Sign in successful",
                "user", Map.of(
                        "id", user.getUserId(),
                        "email", user.getEmail(),
                        "displayName", user.getDisplayName()
                )
        ));
    }

    // GET /api/v1/auth/check?email=...
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkRegistration(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("registered", false));
        }
        String cleanEmail = email.trim().toLowerCase();
        boolean isRegistered = userSettingsRepository.findByUserId(cleanEmail).isPresent();
        return ResponseEntity.ok(Map.of("registered", isRegistered, "email", cleanEmail));
    }
}
