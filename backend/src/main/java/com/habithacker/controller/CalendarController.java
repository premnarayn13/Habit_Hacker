package com.habithacker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCalendarData(
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            Authentication authentication) {

        String userId = authentication.getName();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> calendarTasks = List.of(
            Map.of("id", "t-101", "type", "TASK", "title", "Complete Machine Learning Architecture Document", "date", today.toString(), "time", "09:00", "durationMinutes", 120, "priority", "CRITICAL", "category", "Education", "status", "IN_PROGRESS"),
            Map.of("id", "t-102", "type", "TASK", "title", "Submit Weekly Habit Hacker Progress Report", "date", today.plusDays(1).toString(), "time", "14:00", "durationMinutes", 60, "priority", "HIGH", "category", "Projects", "status", "PLANNED")
        );

        List<Map<String, Object>> calendarSubtasks = List.of(
            Map.of("id", "sub-101-1", "type", "SUBTASK", "parentTaskId", "t-101", "title", "Subtask: Build Data Flow Diagram", "date", today.toString(), "time", "10:00", "durationMinutes", 60, "priority", "HIGH", "status", "COMPLETED"),
            Map.of("id", "sub-101-2", "type", "SUBTASK", "parentTaskId", "t-101", "title", "Subtask: Draft Technical Specification", "date", today.toString(), "time", "11:30", "durationMinutes", 45, "priority", "MEDIUM", "status", "IN_PROGRESS")
        );

        List<Map<String, Object>> calendarHabits = List.of(
            Map.of("id", "h-1", "type", "HABIT", "name", "Learn 5 New Words", "date", today.toString(), "time", "08:00", "color", "#10B981", "status", "COMPLETED"),
            Map.of("id", "h-2", "type", "HABIT", "name", "30 mins Daily Workout", "date", today.toString(), "time", "18:00", "color", "#3B82F6", "status", "PENDING")
        );

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("from", from != null ? from : today.minusDays(15).toString());
        response.put("to", to != null ? to : today.plusDays(15).toString());
        response.put("tasks", calendarTasks);
        response.put("subtasks", calendarSubtasks);
        response.put("habits", calendarHabits);

        return ResponseEntity.ok(response);
    }
}
