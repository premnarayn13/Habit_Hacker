package com.habithacker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class AnalyticsController {

    @GetMapping("/heatmaps")
    public ResponseEntity<Map<String, Object>> getHeatmaps(
            @RequestParam(value = "type", defaultValue = "ALL") String type,
            Authentication authentication) {

        String userId = authentication.getName();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> mainTaskHeatmap = new ArrayList<>();
        List<Map<String, Object>> subtaskHeatmap = new ArrayList<>();
        List<Map<String, Object>> habitHeatmap = new ArrayList<>();
        List<Map<String, Object>> disciplineHeatmap = new ArrayList<>();

        for (int i = 29; i >= 0; i--) {
            String dateStr = today.minusDays(i).toString();
            int intensityVal = 50 + (i * 7) % 51;
            mainTaskHeatmap.add(Map.of("date", dateStr, "count", (i % 6) + 2, "intensity", intensityVal > 80 ? 4 : intensityVal > 60 ? 3 : 2));
            subtaskHeatmap.add(Map.of("date", dateStr, "count", (i % 9) + 4, "intensity", intensityVal > 75 ? 4 : 2));
            habitHeatmap.add(Map.of("date", dateStr, "count", (i % 4) + 3, "intensity", intensityVal > 85 ? 4 : 3));
            disciplineHeatmap.add(Map.of("date", dateStr, "score", intensityVal, "grade", intensityVal >= 85 ? "EXCELLENT" : "STRONG"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("mainTaskHeatmap", mainTaskHeatmap);
        response.put("subtaskHeatmap", subtaskHeatmap);
        response.put("habitHeatmap", habitHeatmap);
        response.put("disciplineHeatmap", disciplineHeatmap);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/bargraphs")
    public ResponseEntity<Map<String, Object>> getBarGraphs(Authentication authentication) {
        String userId = authentication.getName();

        List<Map<String, Object>> completedVsPlanned = List.of(
            Map.of("day", "Mon", "planned", 8, "completed", 7),
            Map.of("day", "Tue", "planned", 10, "completed", 9),
            Map.of("day", "Wed", "planned", 6, "completed", 6),
            Map.of("day", "Thu", "planned", 9, "completed", 8),
            Map.of("day", "Fri", "planned", 12, "completed", 11),
            Map.of("day", "Sat", "planned", 5, "completed", 5),
            Map.of("day", "Sun", "planned", 4, "completed", 4)
        );

        List<Map<String, Object>> estimatedVsActualTime = List.of(
            Map.of("category", "Education", "estimatedHours", 14.5, "actualHours", 16.2),
            Map.of("category", "Coding", "estimatedHours", 18.0, "actualHours", 21.5),
            Map.of("category", "Health", "estimatedHours", 6.0, "actualHours", 5.8),
            Map.of("category", "Personal", "estimatedHours", 4.0, "actualHours", 4.5)
        );

        List<Map<String, Object>> subtaskPerformanceBarChart = List.of(
            Map.of("category", "Education Subtasks", "completed", 42, "planned", 45),
            Map.of("category", "Coding Subtasks", "completed", 58, "planned", 60),
            Map.of("category", "Personal Subtasks", "completed", 20, "planned", 22)
        );

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("completedVsPlanned", completedVsPlanned);
        response.put("estimatedVsActualTime", estimatedVsActualTime);
        response.put("subtaskPerformance", subtaskPerformanceBarChart);

        return ResponseEntity.ok(response);
    }
}
