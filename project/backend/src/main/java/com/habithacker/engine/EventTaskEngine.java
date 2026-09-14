package com.habithacker.engine;

import com.habithacker.entity.EventLog;
import com.habithacker.entity.Subtask;
import com.habithacker.entity.Task;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Spring Boot Engine for Event-Count Tasks, Cross-Day Accumulation,
 * Event Finalization, and Segmented Event Bar Metrics.
 */
@Component
public class EventTaskEngine {

    /**
     * Calculates total accumulated work toward the current event across all subtasks.
     */
    public double calculateCurrentEventWork(List<Subtask> subtasks) {
        if (subtasks == null || subtasks.isEmpty()) return 0.0;
        
        double totalWork = 0.0;
        for (Subtask st : subtasks) {
            double work = st.getLoggedMeasureVal() != null ? st.getLoggedMeasureVal() 
                    : (st.getMeasureTarget() != null ? st.getMeasureTarget() : 0.0);
            totalWork += work;
        }

        return Math.round(totalWork * 10.0) / 10.0;
    }

    /**
     * Evaluates if total work accumulated >= eventUnitTarget.
     */
    public boolean isEventConditionSatisfied(Task parentTask, List<Subtask> subtasks) {
        if (parentTask == null) return false;
        double eventUnitTarget = parentTask.getMeasureTarget() != null ? parentTask.getMeasureTarget() : 10.0;
        double currentWork = calculateCurrentEventWork(subtasks);
        return currentWork >= eventUnitTarget;
    }

    /**
     * Finalizes the current event and returns an immutable EventLog record.
     */
    public EventLog finalizeCurrentEvent(Task parentTask, List<Subtask> subtasks, LocalDate completionDate) {
        if (parentTask == null) return null;

        LocalDate date = completionDate != null ? completionDate : LocalDate.now();
        int eventNumber = (parentTask.getCurrentCount() != null ? parentTask.getCurrentCount() : 0) + 1;
        double eventUnitTarget = parentTask.getMeasureTarget() != null ? parentTask.getMeasureTarget() : 10.0;
        String eventUnitName = parentTask.getMeasureUnit() != null ? parentTask.getMeasureUnit() : "units";

        double totalWork = calculateCurrentEventWork(subtasks);
        String eventId = "ev-" + parentTask.getId() + "-" + System.currentTimeMillis() + "-" + eventNumber;

        // Mock JSON representation of subtask contributions
        StringBuilder jsonBuilder = new StringBuilder("[");
        if (subtasks != null) {
            for (int i = 0; i < subtasks.size(); i++) {
                Subtask st = subtasks.get(i);
                double work = st.getLoggedMeasureVal() != null ? st.getLoggedMeasureVal() : 0.0;
                double pct = totalWork > 0 ? (work / totalWork) * 100.0 : 0.0;
                jsonBuilder.append(String.format(
                        "{\"subtaskId\":\"%s\",\"subtaskTitle\":\"%s\",\"workAmount\":%.1f,\"percentage\":%.1f}",
                        st.getId(), st.getTitle(), work, pct
                ));
                if (i < subtasks.size() - 1) jsonBuilder.append(",");
            }
        }
        jsonBuilder.append("]");

        EventLog eventLog = new EventLog(
                eventId,
                parentTask.getId(),
                "default-user",
                eventNumber,
                date,
                eventUnitTarget,
                eventUnitName,
                totalWork,
                jsonBuilder.toString()
        );

        eventLog.setCompletionTimestamp(LocalDateTime.now());
        eventLog.setStatus("FINALIZED");

        return eventLog;
    }
}
