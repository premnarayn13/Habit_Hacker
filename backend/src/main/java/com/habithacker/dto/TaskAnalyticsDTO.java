package com.habithacker.dto;

import java.util.List;
import java.util.Map;

public class TaskAnalyticsDTO {

    private String taskId;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String trackingMode;
    private String plannedStart;
    private String plannedEnd;
    private Boolean isOptional;
    private Boolean isArchived;
    
    // 20+ Metadata Metrics
    private Integer totalWindowDays;
    private Integer activeOperationalDays;
    private Integer archiveCount;
    private Integer pausedDays;
    private Integer targetCount;
    private Integer completedCount;
    private Integer remainingTargetCount;
    private Double completionPercentage;
    
    // Feasibility & Pace Engines
    private Boolean isFeasible;
    private Integer graceDaysRemaining;
    private String feasibilityWarning;
    private Double requiredDailyPace;
    private Double currentDailyPace;
    private Double paceDifference;

    // Subtask Analytics
    private Integer totalSubtasksCount;
    private Integer subtasksCompletedCount;
    private String mostMissedSubtaskTitle;
    private Integer mostMissedSubtaskCount;

    // Data Series for Charts
    private List<Map<String, Object>> dailyMeasureBreakdown;
    private List<Map<String, Object>> eventHistogramData;
    private List<List<Integer>> heatmapMatrix;

    public TaskAnalyticsDTO() {}

    // Getters and Setters
    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getTrackingMode() { return trackingMode; }
    public void setTrackingMode(String trackingMode) { this.trackingMode = trackingMode; }

    public String getPlannedStart() { return plannedStart; }
    public void setPlannedStart(String plannedStart) { this.plannedStart = plannedStart; }

    public String getPlannedEnd() { return plannedEnd; }
    public void setPlannedEnd(String plannedEnd) { this.plannedEnd = plannedEnd; }

    public Boolean getIsOptional() { return isOptional; }
    public void setIsOptional(Boolean isOptional) { this.isOptional = isOptional; }

    public Boolean getIsArchived() { return isArchived; }
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    public Integer getTotalWindowDays() { return totalWindowDays; }
    public void setTotalWindowDays(Integer totalWindowDays) { this.totalWindowDays = totalWindowDays; }

    public Integer getActiveOperationalDays() { return activeOperationalDays; }
    public void setActiveOperationalDays(Integer activeOperationalDays) { this.activeOperationalDays = activeOperationalDays; }

    public Integer getArchiveCount() { return archiveCount; }
    public void setArchiveCount(Integer archiveCount) { this.archiveCount = archiveCount; }

    public Integer getPausedDays() { return pausedDays; }
    public void setPausedDays(Integer pausedDays) { this.pausedDays = pausedDays; }

    public Integer getTargetCount() { return targetCount; }
    public void setTargetCount(Integer targetCount) { this.targetCount = targetCount; }

    public Integer getCompletedCount() { return completedCount; }
    public void setCompletedCount(Integer completedCount) { this.completedCount = completedCount; }

    public Integer getRemainingTargetCount() { return remainingTargetCount; }
    public void setRemainingTargetCount(Integer remainingTargetCount) { this.remainingTargetCount = remainingTargetCount; }

    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

    public Boolean getIsFeasible() { return isFeasible; }
    public void setIsFeasible(Boolean isFeasible) { this.isFeasible = isFeasible; }

    public Integer getGraceDaysRemaining() { return graceDaysRemaining; }
    public void setGraceDaysRemaining(Integer graceDaysRemaining) { this.graceDaysRemaining = graceDaysRemaining; }

    public String getFeasibilityWarning() { return feasibilityWarning; }
    public void setFeasibilityWarning(String feasibilityWarning) { this.feasibilityWarning = feasibilityWarning; }

    public Double getRequiredDailyPace() { return requiredDailyPace; }
    public void setRequiredDailyPace(Double requiredDailyPace) { this.requiredDailyPace = requiredDailyPace; }

    public Double getCurrentDailyPace() { return currentDailyPace; }
    public void setCurrentDailyPace(Double currentDailyPace) { this.currentDailyPace = currentDailyPace; }

    public Double getPaceDifference() { return paceDifference; }
    public void setPaceDifference(Double paceDifference) { this.paceDifference = paceDifference; }

    public Integer getTotalSubtasksCount() { return totalSubtasksCount; }
    public void setTotalSubtasksCount(Integer totalSubtasksCount) { this.totalSubtasksCount = totalSubtasksCount; }

    public Integer getSubtasksCompletedCount() { return subtasksCompletedCount; }
    public void setSubtasksCompletedCount(Integer subtasksCompletedCount) { this.subtasksCompletedCount = subtasksCompletedCount; }

    public String getMostMissedSubtaskTitle() { return mostMissedSubtaskTitle; }
    public void setMostMissedSubtaskTitle(String mostMissedSubtaskTitle) { this.mostMissedSubtaskTitle = mostMissedSubtaskTitle; }

    public Integer getMostMissedSubtaskCount() { return mostMissedSubtaskCount; }
    public void setMostMissedSubtaskCount(Integer mostMissedSubtaskCount) { this.mostMissedSubtaskCount = mostMissedSubtaskCount; }

    public List<Map<String, Object>> getDailyMeasureBreakdown() { return dailyMeasureBreakdown; }
    public void setDailyMeasureBreakdown(List<Map<String, Object>> dailyMeasureBreakdown) { this.dailyMeasureBreakdown = dailyMeasureBreakdown; }

    public List<Map<String, Object>> getEventHistogramData() { return eventHistogramData; }
    public void setEventHistogramData(List<Map<String, Object>> eventHistogramData) { this.eventHistogramData = eventHistogramData; }

    public List<List<Integer>> getHeatmapMatrix() { return heatmapMatrix; }
    public void setHeatmapMatrix(List<List<Integer>> heatmapMatrix) { this.heatmapMatrix = heatmapMatrix; }
}
