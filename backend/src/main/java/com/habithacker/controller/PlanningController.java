package com.habithacker.controller;

import com.habithacker.engine.CapacityEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/planning")
public class PlanningController {

    private final CapacityEngine capacityEngine;

    public PlanningController(CapacityEngine capacityEngine) {
        this.capacityEngine = capacityEngine;
    }

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getPlanningOverview(
            @RequestParam(value = "availableCapacity", defaultValue = "480") int availableCapacity,
            Authentication authentication) {

        String userId = authentication.getName();
        LocalDate today = LocalDate.now();

        // Sample tasks planned for today
        int plannedTaskMinutes = 390;
        int plannedSubtaskMinutes = 150; // Total 540 mins = 9 hours (Overloaded by 60 mins)

        Map<String, Object> capacity = capacityEngine.calculateDailyCapacity(availableCapacity, plannedTaskMinutes, plannedSubtaskMinutes);

        List<Map<String, Object>> plannedTasks = List.of(
            Map.of("id", "t-101", "title", "Complete Machine Learning Architecture Document", "priority", "CRITICAL", "plannedStart", today.toString(), "plannedEnd", today.toString(), "deadline", today.plusDays(2).toString(), "estimatedMinutes", 180, "isOptional", false),
            Map.of("id", "t-102", "title", "Submit Weekly Habit Hacker Progress Report", "priority", "HIGH", "plannedStart", today.toString(), "plannedEnd", today.toString(), "deadline", today.toString(), "estimatedMinutes", 120, "isOptional", false),
            Map.of("id", "t-103", "title", "Review React Native UI Components & Animations", "priority", "LOW", "plannedStart", today.toString(), "plannedEnd", today.toString(), "deadline", today.plusDays(5).toString(), "estimatedMinutes", 90, "isOptional", true)
        );

        List<Map<String, Object>> plannedSubtasks = List.of(
            Map.of("id", "sub-101-1", "parentTaskId", "t-101", "title", "Subtask: Build Data Flow Diagram", "plannedStart", today.toString(), "scheduledTime", "10:00", "estimatedMinutes", 60, "status", "PLANNED"),
            Map.of("id", "sub-101-2", "parentTaskId", "t-101", "title", "Subtask: Draft Technical Specification", "plannedStart", today.toString(), "scheduledTime", "14:00", "estimatedMinutes", 90, "status", "PLANNED")
        );

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("date", today.toString());
        response.put("capacity", capacity);
        response.put("plannedTasks", plannedTasks);
        response.put("plannedSubtasks", plannedSubtasks);
        response.put("reschedulingSuggestions", List.of(
            "Task 'Review React Native UI Components' is optional and low priority. Postponing it to tomorrow saves 90 minutes and resolves your workload overload."
        ));

        return ResponseEntity.ok(response);
    }
}
