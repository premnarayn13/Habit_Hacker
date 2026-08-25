package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subtask_logs")
public class SubtaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "subtask_id", nullable = false)
    private String subtaskId;

    @Column(name = "parent_task_id", nullable = false)
    private String parentTaskId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "measured_value")
    private Double measuredValue = 0.0;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public SubtaskLog() {}

    public SubtaskLog(String subtaskId, String parentTaskId, String userId, LocalDate logDate, Boolean isCompleted, Double measuredValue) {
        this.subtaskId = subtaskId;
        this.parentTaskId = parentTaskId;
        this.userId = userId;
        this.logDate = logDate;
        this.isCompleted = isCompleted;
        this.measuredValue = measuredValue;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubtaskId() { return subtaskId; }
    public void setSubtaskId(String subtaskId) { this.subtaskId = subtaskId; }

    public String getParentTaskId() { return parentTaskId; }
    public void setParentTaskId(String parentTaskId) { this.parentTaskId = parentTaskId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public Double getMeasuredValue() { return measuredValue; }
    public void setMeasuredValue(Double measuredValue) { this.measuredValue = measuredValue; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
