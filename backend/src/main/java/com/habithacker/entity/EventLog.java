package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_logs")
public class EventLog {

    @Id
    private String id;

    @Column(name = "parent_task_id", nullable = false)
    private String parentTaskId;

    @Column(name = "user_id", nullable = false)
    private String userId = "default-user";

    @Column(name = "event_number", nullable = false)
    private Integer eventNumber;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "completion_timestamp")
    private LocalDateTime completionTimestamp = LocalDateTime.now();

    @Column(name = "event_unit_target")
    private Double eventUnitTarget = 10.0;

    @Column(name = "event_unit_name")
    private String eventUnitName = "units";

    @Column(name = "total_work_accumulated")
    private Double totalWorkAccumulated = 0.0;

    @Column(name = "subtask_contributions_json", columnDefinition = "text")
    private String subtaskContributionsJson = "[]";

    @Column(name = "status")
    private String status = "FINALIZED";

    public EventLog() {}

    public EventLog(String id, String parentTaskId, String userId, Integer eventNumber, LocalDate completionDate, Double eventUnitTarget, String eventUnitName, Double totalWorkAccumulated, String subtaskContributionsJson) {
        this.id = id;
        this.parentTaskId = parentTaskId;
        this.userId = userId;
        this.eventNumber = eventNumber;
        this.completionDate = completionDate;
        this.eventUnitTarget = eventUnitTarget;
        this.eventUnitName = eventUnitName;
        this.totalWorkAccumulated = totalWorkAccumulated;
        this.subtaskContributionsJson = subtaskContributionsJson;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParentTaskId() { return parentTaskId; }
    public void setParentTaskId(String parentTaskId) { this.parentTaskId = parentTaskId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Integer getEventNumber() { return eventNumber; }
    public void setEventNumber(Integer eventNumber) { this.eventNumber = eventNumber; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public LocalDateTime getCompletionTimestamp() { return completionTimestamp; }
    public void setCompletionTimestamp(LocalDateTime completionTimestamp) { this.completionTimestamp = completionTimestamp; }

    public Double getEventUnitTarget() { return eventUnitTarget; }
    public void setEventUnitTarget(Double eventUnitTarget) { this.eventUnitTarget = eventUnitTarget; }

    public String getEventUnitName() { return eventUnitName; }
    public void setEventUnitName(String eventUnitName) { this.eventUnitName = eventUnitName; }

    public Double getTotalWorkAccumulated() { return totalWorkAccumulated; }
    public void setTotalWorkAccumulated(Double totalWorkAccumulated) { this.totalWorkAccumulated = totalWorkAccumulated; }

    public String getSubtaskContributionsJson() { return subtaskContributionsJson; }
    public void setSubtaskContributionsJson(String subtaskContributionsJson) { this.subtaskContributionsJson = subtaskContributionsJson; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
