package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String collab;

    @Column(nullable = false)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "is_optional")
    private Boolean isOptional = false;

    @Column(name = "has_measure_tracking")
    private Boolean hasMeasureTracking = false;

    @Column(name = "measure_unit")
    private String measureUnit = "units";

    @Column(name = "measure_target")
    private Double measureTarget = 0.0;

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private LocalDate deadline;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes = 30;

    @Column(name = "actual_minutes")
    private Integer actualMinutes = 0;

    private String category = "General";
    private String section = "General";

    @Column(name = "tracking_mode")
    private String trackingMode = "end_date"; // end_date, count_days, count_event

    @Column(name = "target_count")
    private Integer targetCount = 50;

    @Column(name = "current_count")
    private Integer currentCount = 0;

    @Column(name = "repeat_rule")
    private String repeatRule = "DAILY";

    @Column(name = "parent_task_id")
    private String parentTaskId;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "is_done_today")
    private Boolean isDoneToday = false;

    public Task() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCollab() { return collab; }
    public void setCollab(String collab) { this.collab = collab; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getIsOptional() { return isOptional; }
    public void setIsOptional(Boolean isOptional) { this.isOptional = isOptional; }

    public Boolean getHasMeasureTracking() { return hasMeasureTracking; }
    public void setHasMeasureTracking(Boolean hasMeasureTracking) { this.hasMeasureTracking = hasMeasureTracking; }

    public String getMeasureUnit() { return measureUnit; }
    public void setMeasureUnit(String measureUnit) { this.measureUnit = measureUnit; }

    public Double getMeasureTarget() { return measureTarget; }
    public void setMeasureTarget(Double measureTarget) { this.measureTarget = measureTarget; }

    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public Integer getActualMinutes() { return actualMinutes; }
    public void setActualMinutes(Integer actualMinutes) { this.actualMinutes = actualMinutes; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getTrackingMode() { return trackingMode; }
    public void setTrackingMode(String trackingMode) { this.trackingMode = trackingMode; }

    public Integer getTargetCount() { return targetCount; }
    public void setTargetCount(Integer targetCount) { this.targetCount = targetCount; }

    public Integer getCurrentCount() { return currentCount; }
    public void setCurrentCount(Integer currentCount) { this.currentCount = currentCount; }

    public String getRepeatRule() { return repeatRule; }
    public void setRepeatRule(String repeatRule) { this.repeatRule = repeatRule; }

    public String getParentTaskId() { return parentTaskId; }
    public void setParentTaskId(String parentTaskId) { this.parentTaskId = parentTaskId; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public Boolean getIsArchived() { return isArchived; }
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }

    public Boolean getIsDoneToday() { return isDoneToday; }
    public void setIsDoneToday(Boolean isDoneToday) { this.isDoneToday = isDoneToday; }

    public String getPlannedStart() { return startDate != null ? startDate.toString() : ""; }
    public String getPlannedEnd() { return endDate != null ? endDate.toString() : ""; }
    public Integer getTargetDayCount() { return targetCount; }
    public Integer getCurrentDayCount() { return currentCount; }
    public Integer getTargetEventCount() { return targetCount; }
    public Integer getCurrentEventCount() { return currentCount; }
}
