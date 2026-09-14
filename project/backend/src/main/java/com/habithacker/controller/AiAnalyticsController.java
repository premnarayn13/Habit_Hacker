package com.habithacker.controller;

import com.habithacker.service.GroqAiInsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AiAnalyticsController {

    @Autowired
    private GroqAiInsightService groqAiInsightService;

    // GET /api/v1/analytics/ai-insights?userId=demo-user-123
    @GetMapping("/ai-insights")
    public ResponseEntity<Map<String, Object>> getAiInsights(
            @RequestParam(defaultValue = "demo-user-123") String userId,
            @RequestParam(defaultValue = "10") Integer totalTasks,
            @RequestParam(defaultValue = "8") Integer completedTasks,
            @RequestParam(defaultValue = "2") Integer missedTasks) {
        
        Map<String, Object> taskMetrics = Map.of(
                "totalTasks", totalTasks,
                "completedTasks", completedTasks,
                "missedTasks", missedTasks,
                "capacityPercentage", Math.round((completedTasks.doubleValue() / Math.max(1, totalTasks)) * 100)
        );

        Map<String, Object> insights = groqAiInsightService.generateProductivityInsights(userId, taskMetrics);
        return ResponseEntity.ok(insights);
    }
}
