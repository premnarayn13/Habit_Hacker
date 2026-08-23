package com.habithacker.service;

import com.habithacker.entity.Task;
import com.habithacker.entity.TaskLog;
import com.habithacker.repository.TaskLogRepository;
import com.habithacker.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskLogRepository taskLogRepository;

    // 1. CALCULATE TOTAL WINDOW SPAN DAYS BETWEEN START DATE & END DATE
    public long calculateTotalSpanDays(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 50;
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return Math.max(1, days);
    }

    // 2. VALIDATION: TARGET DAYS COUNT CANNOT EXCEED WINDOW SPAN
    public void validateTaskParameters(Task task) {
        LocalDate start = task.getStartDate() != null ? task.getStartDate() : LocalDate.now();
        LocalDate end = task.getEndDate() != null ? task.getEndDate() : LocalDate.now().plusDays(45);

        long spanDays = calculateTotalSpanDays(start, end);
        if (spanDays <= 0) {
            throw new IllegalArgumentException("End Date must be greater than or equal to Start Date.");
        }

        if ("count_days".equalsIgnoreCase(task.getTrackingMode())) {
            int target = task.getTargetCount() != null ? task.getTargetCount() : 1;
            if (spanDays < target) {
                throw new IllegalArgumentException("Selected window (" + spanDays + " days) cannot be smaller than target count (" + target + " days).");
            }
        }
    }

    // 3. FETCH & EVALUATE ALL TASKS WITH SUBTASK AUTOMATED TURN COMPLETION
    @Transactional
    public List<Task> getUserTasks(String userId) {
        List<Task> allTasks = taskRepository.findByUserId(userId);
        return processSubtaskLifecycles(allTasks);
    }

    // 4. CREATE NEW TASK OR SUBTASK WITH FULL PARAMETER VALIDATION
    @Transactional
    public Task createTask(Task task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId("t-" + UUID.randomUUID().toString());
        }

        validateTaskParameters(task);

        long spanDays = calculateTotalSpanDays(task.getStartDate(), task.getEndDate());
        if (task.getTargetCount() == null || task.getTargetCount() <= 0) {
            task.setTargetCount((int) spanDays);
        }

        return taskRepository.save(task);
    }

    // 5. UPDATE EXISTING TASK
    @Transactional
    public Task updateTask(String taskId, Task updatedData) {
        Task existing = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        validateTaskParameters(updatedData);

        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setCollab(updatedData.getCollab());
        existing.setPriority(updatedData.getPriority());
        existing.setIsOptional(updatedData.getIsOptional());
        existing.setHasMeasureTracking(updatedData.getHasMeasureTracking());
        existing.setMeasureUnit(updatedData.getMeasureUnit());
        existing.setMeasureTarget(updatedData.getMeasureTarget());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());
        existing.setDeadline(updatedData.getDeadline());
        existing.setEstimatedMinutes(updatedData.getEstimatedMinutes());
        existing.setCategory(updatedData.getCategory());
        existing.setSection(updatedData.getSection());
        existing.setTrackingMode(updatedData.getTrackingMode());
        existing.setTargetCount(updatedData.getTargetCount());
        existing.setParentTaskId(updatedData.getParentTaskId());
        existing.setAttachmentName(updatedData.getAttachmentName());

        return taskRepository.save(existing);
    }

    // 6. LOG DAILY TASK COMPLETION WITH OPTIONAL QUANTITATIVE MEASURE VALUE
    @Transactional
    public Task logDailyTaskCompletion(String taskId, String userId, Double customMeasureValue) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        int target = task.getTargetCount() != null ? task.getTargetCount() : 50;
        int nextCount = Math.min(target, (task.getCurrentCount() != null ? task.getCurrentCount() : 0) + 1);
        int nextProg = (int) Math.round(((double) nextCount / target) * 100);

        task.setCurrentCount(nextCount);
        task.setProgressPercent(nextProg);
        task.setIsDoneToday(true);

        // Record Daily Activity Log in task_logs table
        TaskLog log = new TaskLog();
        log.setTaskId(taskId);
        log.setUserId(userId);
        log.setLoggedAt(LocalDateTime.now());
        log.setIncrementValue(1);
        log.setMeasuredValue(customMeasureValue != null ? customMeasureValue : 0.0);
        taskLogRepository.save(log);

        Task savedTask = taskRepository.save(task);

        // Evaluate parent tasks if this is a subtask
        if (task.getParentTaskId() != null && !task.getParentTaskId().isEmpty()) {
            evaluateParentTaskCompletion(task.getParentTaskId(), userId);
        }

        return savedTask;
    }

    // 7. UNDO TODAY'S COMPLETION
    @Transactional
    public Task undoTaskCompletion(String taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        int prevCount = Math.max(0, (task.getCurrentCount() != null ? task.getCurrentCount() : 1) - 1);
        int target = task.getTargetCount() != null ? task.getTargetCount() : 50;
        int prevProg = (int) Math.round(((double) prevCount / target) * 100);

        task.setCurrentCount(prevCount);
        task.setProgressPercent(prevProg);
        task.setIsDoneToday(false);

        Task saved = taskRepository.save(task);

        // Remove recent task_log entry
        List<TaskLog> logs = taskLogRepository.findByTaskId(taskId);
        if (!logs.isEmpty()) {
            TaskLog recent = logs.get(logs.size() - 1);
            taskLogRepository.delete(recent);
        }

        return saved;
    }

    // 8. ARCHIVE OR UNARCHIVE TASK WITH PAUSE DURATION EXTENSION
    @Transactional
    public Task toggleArchiveTask(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        if (Boolean.TRUE.equals(task.getIsArchived())) {
            // Unarchiving: extend endDate by paused duration
            LocalDateTime archiveTime = task.getArchivedAt() != null ? task.getArchivedAt() : LocalDateTime.now().minusDays(5);
            long daysArchived = Math.max(1, ChronoUnit.DAYS.between(archiveTime, LocalDateTime.now()));

            if (task.getEndDate() != null) {
                task.setEndDate(task.getEndDate().plusDays(daysArchived));
                task.setDeadline(task.getEndDate());
            }

            task.setIsArchived(false);
            task.setArchivedAt(null);
        } else {
            // Archiving
            task.setIsArchived(true);
            task.setArchivedAt(LocalDateTime.now());
        }

        return taskRepository.save(task);
    }

    // 9. MAP / UNMAP SUBTASK PARENT
    @Transactional
    public Task mapParentTask(String taskId, String parentTaskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        task.setParentTaskId(parentTaskId != null ? parentTaskId : "");
        return taskRepository.save(task);
    }

    // 10. FETCH DAILY MEASURE LOGS HISTORY FOR BAR CHART ANALYTICS
    public List<TaskLog> getTaskMeasureHistory(String taskId) {
        return taskLogRepository.findByTaskId(taskId);
    }

    // 11. EVALUATE PARENT TURN COMPLETION DRIVEN BY CHILD SUBTASKS
    @Transactional
    public void evaluateParentTaskCompletion(String parentTaskId, String userId) {
        Task parentTask = taskRepository.findById(parentTaskId).orElse(null);
        if (parentTask == null) return;

        List<Task> childTasks = taskRepository.findByParentTaskId(parentTaskId);
        if (childTasks.isEmpty()) return;

        boolean allCompletedForToday = childTasks.stream()
                .allMatch(c -> Boolean.TRUE.equals(c.getIsDoneToday()) || (c.getProgressPercent() != null && c.getProgressPercent() >= 100));

        int targetMax = parentTask.getTargetCount() != null ? parentTask.getTargetCount() : 45;
        int current = parentTask.getCurrentCount() != null ? parentTask.getCurrentCount() : 0;

        if (allCompletedForToday) {
            parentTask.setIsDoneToday(true);
            if (current == 0) current = 1;
        } else {
            parentTask.setIsDoneToday(false);
        }

        int parentProg = (int) Math.round(((double) current / targetMax) * 100);
        parentTask.setCurrentCount(current);
        parentTask.setProgressPercent(parentProg);

        taskRepository.save(parentTask);
    }

    // 12. SUBTASK LIFECYCLE EVALUATOR ENGINE (RULES A & B)
    private List<Task> processSubtaskLifecycles(List<Task> rawTasks) {
        LocalDate today = LocalDate.now();

        // Rule A & B: Unmap subtasks if parent ended or subtask ended before parent
        for (Task task : rawTasks) {
            if (task.getParentTaskId() != null && !task.getParentTaskId().isEmpty()) {
                Task parent = rawTasks.stream()
                        .filter(p -> p.getId().equals(task.getParentTaskId()))
                        .findFirst()
                        .orElse(null);

                // Rule B: Parent ends or archived -> Unmap to solo task!
                if (parent == null || Boolean.TRUE.equals(parent.getIsArchived()) || (parent.getEndDate() != null && parent.getEndDate().isBefore(today) && parent.getProgressPercent() >= 100)) {
                    task.setParentTaskId("");
                } 
                // Rule A: Subtask ends before parent -> Unmap naturally!
                else if (task.getEndDate() != null && task.getEndDate().isBefore(today) && parent.getEndDate() != null && !parent.getEndDate().isBefore(today)) {
                    task.setParentTaskId("");
                }
            }
        }

        // Automated Parent Completion Evaluation driven by Child Subtasks
        for (Task task : rawTasks) {
            List<Task> children = rawTasks.stream()
                    .filter(c -> task.getId().equals(c.getParentTaskId()))
                    .collect(Collectors.toList());

            if (!children.isEmpty()) {
                boolean allChildDone = children.stream().allMatch(c -> Boolean.TRUE.equals(c.getIsDoneToday()) || (c.getProgressPercent() != null && c.getProgressPercent() >= 100));
                if (allChildDone) {
                    task.setIsDoneToday(true);
                    if (task.getCurrentCount() == null || task.getCurrentCount() == 0) {
                        task.setCurrentCount(1);
                    }
                }
            }
        }

        return rawTasks;
    }
}
