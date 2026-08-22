package com.habithacker.engine;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class DisciplineEngine {

    /**
     * Discipline Formula Version 1:
     * 40% Required Task Completion
     * 25% On-Time Completion
     * 25% Habit Consistency
     * 10% Plan Adherence
     */
    public Map<String, Object> calculateDisciplineScore(
            int requiredTasksTotal, int requiredTasksCompleted,
            int onTimeCompletedCount,
            int habitsExpected, int habitsCompleted,
            int plannedWorkUnits, int completedWorkUnits) {

        double taskCompletionRate = requiredTasksTotal > 0 ? (requiredTasksCompleted * 100.0 / requiredTasksTotal) : 100.0;
        double onTimeRate = requiredTasksCompleted > 0 ? (onTimeCompletedCount * 100.0 / requiredTasksCompleted) : 100.0;
        double habitConsistencyRate = habitsExpected > 0 ? (habitsCompleted * 100.0 / habitsExpected) : 100.0;
        double planAdherenceRate = plannedWorkUnits > 0 ? Math.min(100.0, (completedWorkUnits * 100.0 / plannedWorkUnits)) : 100.0;

        double weightedScore = (0.40 * taskCompletionRate) +
                               (0.25 * onTimeRate) +
                               (0.25 * habitConsistencyRate) +
                               (0.10 * planAdherenceRate);

        int disciplineScore = (int) Math.round(Math.max(0, Math.min(100, weightedScore)));

        String grade = "EXCELLENT";
        if (disciplineScore < 50) grade = "POOR";
        else if (disciplineScore < 70) grade = "MODERATE";
        else if (disciplineScore < 85) grade = "STRONG";

        Map<String, Object> scorecard = new HashMap<>();
        scorecard.put("disciplineScore", disciplineScore);
        scorecard.put("grade", grade);
        scorecard.put("taskCompletionRate", Math.round(taskCompletionRate));
        scorecard.put("onTimeRate", Math.round(onTimeRate));
        scorecard.put("habitConsistencyRate", Math.round(habitConsistencyRate));
        scorecard.put("planAdherenceRate", Math.round(planAdherenceRate));
        scorecard.put("formulaVersion", 1);

        return scorecard;
    }
}
