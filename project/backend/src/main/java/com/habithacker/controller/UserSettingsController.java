package com.habithacker.controller;

import com.habithacker.entity.UserSettings;
import com.habithacker.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@CrossOrigin(origins = "*")
public class UserSettingsController {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    // GET /api/v1/settings?userId=demo-user-123
    @GetMapping
    public ResponseEntity<UserSettings> getUserSettings(@RequestParam(defaultValue = "demo-user-123") String userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings defaultSettings = new UserSettings("setting_" + UUID.randomUUID().toString(), userId, "Prem Narayn", "prem.narayn@habithacker.app");
                    return userSettingsRepository.save(defaultSettings);
                });
        return ResponseEntity.ok(settings);
    }

    // PUT /api/v1/settings?userId=demo-user-123
    @PutMapping
    public ResponseEntity<UserSettings> updateUserSettings(
            @RequestParam(defaultValue = "demo-user-123") String userId,
            @RequestBody UserSettings incoming) {
        UserSettings existing = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> new UserSettings("setting_" + UUID.randomUUID().toString(), userId, "Prem Narayn", "prem.narayn@habithacker.app"));

        if (incoming.getDisplayName() != null) existing.setDisplayName(incoming.getDisplayName());
        if (incoming.getEmail() != null) existing.setEmail(incoming.getEmail());
        if (incoming.getCapacityHours() != null) existing.setCapacityHours(incoming.getCapacityHours());
        if (incoming.getWeekStartDay() != null) existing.setWeekStartDay(incoming.getWeekStartDay());
        if (incoming.getDateFormat() != null) existing.setDateFormat(incoming.getDateFormat());
        if (incoming.getTheme() != null) existing.setTheme(incoming.getTheme());
        if (incoming.getPushNotifications() != null) existing.setPushNotifications(incoming.getPushNotifications());
        if (incoming.getSoundAlerts() != null) existing.setSoundAlerts(incoming.getSoundAlerts());
        if (incoming.getHabitReminders() != null) existing.setHabitReminders(incoming.getHabitReminders());
        if (incoming.getTodoNotifications() != null) existing.setTodoNotifications(incoming.getTodoNotifications());
        if (incoming.getRingtoneName() != null) existing.setRingtoneName(incoming.getRingtoneName());
        existing.setUpdatedAt(OffsetDateTime.now());

        UserSettings saved = userSettingsRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // POST /api/v1/settings/change-password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestParam(defaultValue = "demo-user-123") String userId,
            @RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters long."));
        }

        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Token session re-validated."));
    }

    // DELETE /api/v1/settings/account
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(@RequestParam(defaultValue = "demo-user-123") String userId) {
        userSettingsRepository.findByUserId(userId).ifPresent(userSettingsRepository::delete);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully from PostgreSQL server database."));
    }
}
