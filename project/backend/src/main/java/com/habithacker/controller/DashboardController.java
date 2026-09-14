package com.habithacker.controller;

import com.habithacker.engine.CapacityEngine;
import com.habithacker.engine.DisciplineEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final CapacityEngine capacityEngine;
    private final DisciplineEngine disciplineEngine;

    public DashboardController(CapacityEngine capacityEngine, DisciplineEngine disciplineEngine) {
        this.capacityEngine = capacityEngine;
        this.disciplineEngine = disciplineEngine;
    }

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodayDashboard(Authentication authentication) {
        String userId = authentication.getName();
        LocalDate today = LocalDate.now();

        // Sample aggregated dashboard response structure matching spec
        Map<String, Object> capacity = capacityEngine.calculateDailyCapacity(480, 240, 90); // 330 mins planned out of 480 mins
        Map<String, Object> discipline = disciplineEngine.calculateDisciplineScore(8, 7, 6, 5, 4, 10, 8);

        List<Map<String, Object>> topPriorities = List.of(
            Map.of("id", "t-101", "title", "Complete Machine Learning Architecture Document", "priority", "CRITICAL", "progressPercent", 65, "deadline", today.toString(), "estimatedMinutes", 120, "isOptional", false, "category", "Education"),
            Map.of("id", "t-102", "title", "Submit Weekly Habit Hacker Progress Report", "priority", "HIGH", "progressPercent", 40, "deadline", today.plusDays(1).toString(), "estimatedMinutes", 60, "isOptional", false, "category", "Projects"),
            Map.of("id", "t-103", "title", "Review React Native UI Components & Animations", "priority", "MEDIUM", "progressPercent", 100, "deadline", today.toString(), "estimatedMinutes", 45, "isOptional", true, "category", "Coding")
        );

        List<Map<String, Object>> todaySubtasks = List.of(
            Map.of("id", "sub-1", "parentTaskId", "t-101", "title", "Subtask 1: Complete Section 2 Diagram", "status", "COMPLETED", "plannedStart", today.toString(), "estimatedMinutes", 30, "actualMinutes", 28),
            Map.of("id", "sub-2", "parentTaskId", "t-101", "title", "Subtask 2: Finalize Code Snippet Benchmarks", "status", "IN_PROGRESS", "plannedStart", today.toString(), "estimatedMinutes", 45, "actualMinutes", 30)
        );

        List<Map<String, Object>> habits = List.of(
            Map.of("id", "h-1", "name", "Learn 5 New Words", "habitType", "COUNT", "targetValue", 5, "actualValue", 4, "completionPercent", 80, "streakDays", 12, "color", "#10B981"),
            Map.of("id", "h-2", "name", "30 mins Daily Workout", "habitType", "DURATION", "targetValue", 30, "actualValue", 30, "completionPercent", 100, "streakDays", 7, "color", "#3B82F6"),
            Map.of("id", "h-3", "name", "Drink 8 Glasses of Water", "habitType", "QUANTITY", "targetValue", 8, "actualValue", 6, "completionPercent", 75, "streakDays", 4, "color", "#06B6D4")
        );

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("date", today.toString());
        response.put("greeting", "Good day! Here is your personal productivity overview.");
        response.put("topPriorities", topPriorities);
        response.put("todaySubtasks", todaySubtasks);
        response.put("habits", habits);
        response.put("capacity", capacity);
        response.put("discipline", discipline);
        response.put("quickMetrics", Map.of(
            "taskCompletionRate", 87,
            "disciplineScore", discipline.get("disciplineScore"),
            "focusMinutes", 165,
            "currentStreak", 12
        ));

        return ResponseEntity.ok(response);
    }
}
