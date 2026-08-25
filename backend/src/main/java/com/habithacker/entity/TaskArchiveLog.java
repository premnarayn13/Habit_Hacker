package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_archive_logs")
public class TaskArchiveLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "task_id", nullable = false)
    private String taskId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "archived_at", nullable = false)
    private LocalDateTime archivedAt;

    @Column(name = "unarchived_at")
    private LocalDateTime unarchivedAt;

    @Column(name = "paused_days")
    private Integer pausedDays = 0;

    @Column(name = "extension_applied_days")
    private Integer extensionAppliedDays = 0;

    public TaskArchiveLog() {}

    public TaskArchiveLog(String taskId, String userId, LocalDateTime archivedAt) {
        this.taskId = taskId;
        this.userId = userId;
        this.archivedAt = archivedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }

    public LocalDateTime getUnarchivedAt() { return unarchivedAt; }
    public void setUnarchivedAt(LocalDateTime unarchivedAt) { this.unarchivedAt = unarchivedAt; }

    public Integer getPausedDays() { return pausedDays; }
    public void setPausedDays(Integer pausedDays) { this.pausedDays = pausedDays; }

    public Integer getExtensionAppliedDays() { return extensionAppliedDays; }
    public void setExtensionAppliedDays(Integer extensionAppliedDays) { this.extensionAppliedDays = extensionAppliedDays; }
}
