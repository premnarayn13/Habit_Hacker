package com.habithacker.controller;

import com.habithacker.dto.TaskAnalyticsDTO;
import com.habithacker.service.TaskAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskAnalyticsController {

    @Autowired
    private TaskAnalyticsService taskAnalyticsService;

    // GET /api/tasks/{taskId}/analytics
    @GetMapping("/{taskId}/analytics")
    public ResponseEntity<TaskAnalyticsDTO> getTaskAnalytics(@PathVariable String taskId) {
        TaskAnalyticsDTO analytics = taskAnalyticsService.computeTaskAnalytics(taskId);
        return ResponseEntity.ok(analytics);
    }

    // GET /api/tasks/{taskId}/calendar-day?date=2026-08-25
    @GetMapping("/{taskId}/calendar-day")
    public ResponseEntity<Map<String, Object>> getCalendarDayInspection(
            @PathVariable String taskId,
            @RequestParam String date) {
        Map<String, Object> dayInfo = Map.of(
            "taskId", taskId,
            "date", date,
            "isCompleted", true,
            "measuredValue", 10.0,
            "completedSubtasks", java.util.List.of("Subtask 1", "Subtask 2"),
            "missedSubtasks", java.util.List.of()
        );
        return ResponseEntity.ok(dayInfo);
    }
}
