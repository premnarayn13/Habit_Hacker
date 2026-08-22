package com.habithacker.engine;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class SubtaskAnalyticsEngine {

    public int calculateParentProgressFromSubtasks(int totalSubtasks, int completedSubtasks, int partialSubtaskProgressSum) {
        if (totalSubtasks <= 0) {
            return 0;
        }
        double rawProgress = ((completedSubtasks * 100.0) + partialSubtaskProgressSum) / totalSubtasks;
        return (int) Math.min(100, Math.round(rawProgress));
    }

    public Map<String, Object> generateSubtaskHeatmapData(List<Map<String, Object>> dailySubtaskActivity) {
        Map<String, Object> heatmapData = new HashMap<>();
        heatmapData.put("type", "SUBTASKS");
        heatmapData.put("dailyActivity", dailySubtaskActivity);
        
        int totalSubtasksCompleted = dailySubtaskActivity.stream()
                .mapToInt(d -> ((Number) d.getOrDefault("count", 0)).intValue())
                .sum();
        
        heatmapData.put("totalSubtasksCompleted", totalSubtasksCompleted);
        return heatmapData;
    }
}
