package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subtasks")
public class Subtask {

    @Id
    private String id;

    @Column(name = "parent_task_id", nullable = false)
    private String parentTaskId;

    @Column(nullable = false)
    private String title;

    private String priority = "MEDIUM";

    @Column(name = "is_optional")
    private Boolean isOptional = false;

    private String status = "PLANNED"; // PLANNED, IN_PROGRESS, COMPLETED

    @Column(name = "target_value")
    private Integer targetValue = 1;

    @Column(name = "completed_value")
    private Integer completedValue = 0;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes = 15;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Subtask() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParentTaskId() { return parentTaskId; }
    public void setParentTaskId(String parentTaskId) { this.parentTaskId = parentTaskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getIsOptional() { return isOptional; }
    public void setIsOptional(Boolean isOptional) { this.isOptional = isOptional; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTargetValue() { return targetValue; }
    public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }

    public Integer getCompletedValue() { return completedValue; }
    public void setCompletedValue(Integer completedValue) { this.completedValue = completedValue; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
