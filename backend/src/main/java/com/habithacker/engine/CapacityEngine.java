package com.habithacker.engine;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class CapacityEngine {

    public Map<String, Object> calculateDailyCapacity(int availableCapacityMinutes, int plannedTaskMinutes, int plannedSubtaskMinutes) {
        int totalPlannedMinutes = plannedTaskMinutes + plannedSubtaskMinutes;
        int overloadMinutes = Math.max(0, totalPlannedMinutes - availableCapacityMinutes);
        boolean isOverloaded = overloadMinutes > 0;

        double availableHours = Math.round((availableCapacityMinutes / 60.0) * 10.0) / 10.0;
        double plannedHours = Math.round((totalPlannedMinutes / 60.0) * 10.0) / 10.0;
        double overloadHours = Math.round((overloadMinutes / 60.0) * 10.0) / 10.0;

        String warningMessage = null;
        if (isOverloaded) {
            warningMessage = String.format("This day is overplanned by %d minutes (%.1f hours). Total planned work is %.1fh against %.1fh available capacity.",
                    overloadMinutes, overloadHours, plannedHours, availableHours);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("availableCapacityMinutes", availableCapacityMinutes);
        result.put("plannedTaskMinutes", plannedTaskMinutes);
        result.put("plannedSubtaskMinutes", plannedSubtaskMinutes);
        result.put("totalPlannedMinutes", totalPlannedMinutes);
        result.put("overloadMinutes", overloadMinutes);
        result.put("availableHours", availableHours);
        result.put("plannedHours", plannedHours);
        result.put("overloadHours", overloadHours);
        result.put("isOverloaded", isOverloaded);
        result.put("warningMessage", warningMessage);
        result.put("workloadPercentage", availableCapacityMinutes > 0 ? (int) Math.min(200, (totalPlannedMinutes * 100.0 / availableCapacityMinutes)) : 0);

        return result;
    }
}
