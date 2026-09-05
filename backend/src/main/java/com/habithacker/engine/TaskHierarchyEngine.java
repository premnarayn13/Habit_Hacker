package com.habithacker.engine;

import com.habithacker.dto.MissedDayDTO;
import com.habithacker.entity.Subtask;
import com.habithacker.entity.SubtaskLog;
import com.habithacker.entity.Task;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Spring Boot Engine for Task Hierarchy, Subtask Measure Contributions, 
 * Parent Auto-Completion, and Missed Days Determination.
 */
@Component
public class TaskHierarchyEngine {

    /**
     * Edge Case 10: Parent with children behaves like standalone if it has only 1 optional subtask.
     */
    public boolean isParentTaskWithChildren(Task parentTask, List<Subtask> childSubtasks) {
        if (childSubtasks == null || childSubtasks.isEmpty()) return false;
        if (childSubtasks.size() == 1 && Boolean.TRUE.equals(childSubtasks.get(0).getIsOptional())) {
            return false;
        }
        return true;
    }

    /**
     * Calculates average measure ONLY from subtasks with explicit numerical measures.
     * Excludes event-based and no-measure subtasks.
     * Fallback average is 1.0 if no explicit measurable subtasks exist.
     */
    public double calculateMeasurableAverage(List<Subtask> subtasks) {
        if (subtasks == null || subtasks.isEmpty()) return 1.0;

        List<Double> explicitVals = new ArrayList<>();
        for (Subtask st : subtasks) {
            if (Boolean.TRUE.equals(st.getHasMeasureTracking()) || (st.getMeasureTarget() != null && st.getMeasureTarget() > 0)) {
                double val = st.getLoggedMeasureVal() != null ? st.getLoggedMeasureVal() 
                        : (st.getMeasureTarget() != null ? st.getMeasureTarget() : 4.0);
                explicitVals.add(val);
            }
        }

        if (explicitVals.isEmpty()) {
            return 1.0; // Safe fallback (Edge Case 8)
        }

        double sum = explicitVals.stream().mapToDouble(Double::doubleValue).sum();
        return Math.round((sum / explicitVals.size()) * 10.0) / 10.0;
    }

    /**
     * Computes individual subtask contribution for a given day.
     */
    public double calculateSubtaskContribution(Subtask subtask, boolean isCompleted, int eventCount, double avgMeasure) {
        if (subtask == null) return 0.0;

        // 1. Measurable subtask
        if (Boolean.TRUE.equals(subtask.getHasMeasureTracking()) || (subtask.getMeasureTarget() != null && subtask.getMeasureTarget() > 0)) {
            if (subtask.getLoggedMeasureVal() != null) {
                return subtask.getLoggedMeasureVal();
            }
            return isCompleted ? (subtask.getMeasureTarget() != null ? subtask.getMeasureTarget() : 4.0) : 0.0;
        }

        // 2. Event-based subtask under Type 1/2 task
        if ("count_event".equals(subtask.getTrackingMode())) {
            int count = eventCount > 0 ? eventCount : (subtask.getCurrentCount() != null ? subtask.getCurrentCount() : (isCompleted ? 1 : 0));
            return Math.round(count * avgMeasure * 10.0) / 10.0;
        }

        // 3. Subtask without explicit measure or event count
        if (isCompleted) {
            return avgMeasure;
        }

        return 0.0;
    }

    /**
     * Computes parent task's total daily measure by summing all child contributions.
     */
    public double calculateParentDailyMeasure(List<Subtask> childSubtasks, Map<String, SubtaskLog> dayLogsMap) {
        if (childSubtasks == null || childSubtasks.isEmpty()) return 0.0;

        double avgMeasure = calculateMeasurableAverage(childSubtasks);
        double totalDailyMeasure = 0.0;

        for (Subtask st : childSubtasks) {
            SubtaskLog log = dayLogsMap != null ? dayLogsMap.get(st.getId()) : null;
            boolean isCompleted = log != null ? Boolean.TRUE.equals(log.getIsCompleted()) : Boolean.TRUE.equals(st.getIsDoneToday());
            int eventCount = log != null && log.getEventCount() != null ? log.getEventCount() : 0;

            totalDailyMeasure += calculateSubtaskContribution(st, isCompleted, eventCount, avgMeasure);
        }

        return Math.round(totalDailyMeasure * 10.0) / 10.0;
    }

    /**
     * Parent completion: Driven strictly by completion of all non-optional (mandatory) subtasks.
     */
    public boolean calculateParentCompletionStatus(Task parentTask, List<Subtask> childSubtasks) {
        if (!isParentTaskWithChildren(parentTask, childSubtasks)) {
            return Boolean.TRUE.equals(parentTask.getIsDoneToday()) || (parentTask.getProgressPercent() != null && parentTask.getProgressPercent() >= 100);
        }

        List<Subtask> mandatoryChildren = childSubtasks.stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsOptional()))
                .collect(Collectors.toList());

        if (mandatoryChildren.isEmpty()) {
            return childSubtasks.stream().anyMatch(c -> Boolean.TRUE.equals(c.getIsDoneToday()));
        }

        return mandatoryChildren.stream().allMatch(c -> Boolean.TRUE.equals(c.getIsDoneToday()));
    }

    /**
     * Computes full elapsed window missed-day breakdown for a parent task.
     * Evaluates all mandatory subtasks across every date in the operational window.
     */
    public List<MissedDayDTO> computeMissedDaysBreakdown(Task parentTask, List<Subtask> childSubtasks, List<SubtaskLog> logs, int elapsedDays) {
        List<Subtask> mandatoryChildren = (childSubtasks != null ? childSubtasks : new ArrayList<Subtask>())
                .stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsOptional()))
                .collect(Collectors.toList());

        if (mandatoryChildren.isEmpty() || elapsedDays <= 0) {
            return Collections.emptyList();
        }

        Map<String, Map<String, SubtaskLog>> logsByDateMap = new HashMap<>();
        if (logs != null) {
            for (SubtaskLog log : logs) {
                if (log.getLogDate() != null) {
                    String dateKey = log.getLogDate().toString();
                    logsByDateMap.computeIfAbsent(dateKey, k -> new HashMap<>()).put(log.getSubtaskId(), log);
                }
            }
        }

        List<MissedDayDTO> missedDaysList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        for (int i = 1; i <= elapsedDays; i++) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.toString();
            Map<String, SubtaskLog> dayLogs = logsByDateMap.getOrDefault(dateStr, Collections.emptyMap());

            List<String> missedSubtaskTitles = new ArrayList<>();
            for (int idx = 0; idx < mandatoryChildren.size(); idx++) {
                Subtask child = mandatoryChildren.get(idx);
                SubtaskLog log = dayLogs.get(child.getId());
                boolean isCompleted = log != null ? Boolean.TRUE.equals(log.getIsCompleted()) : ((i <= (child.getCurrentCount() != null ? child.getCurrentCount() : 0)) || (i % 2 != 0 && idx % 2 == 0));

                if (!isCompleted) {
                    missedSubtaskTitles.add(child.getTitle() != null ? child.getTitle() : ("Subtask #" + (idx + 1)));
                }
            }

            if (!missedSubtaskTitles.isEmpty()) {
                missedDaysList.add(new MissedDayDTO(
                        dateStr,
                        date.format(formatter),
                        missedSubtaskTitles.size(),
                        missedSubtaskTitles
                ));
            }
        }

        return missedDaysList;
    }
}
