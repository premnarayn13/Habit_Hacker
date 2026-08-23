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
import java.util.List;
import java.util.UUID;

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

    // 2. FETCH & EVALUATE ALL TASKS WITH SUBTASK AUTOMATED TURN COMPLETION
    @Transactional
    public List<Task> getUserTasks(String userId) {
        List<Task> allTasks = taskRepository.findByUserId(userId);
        return processSubtaskLifecycles(allTasks);
    }

    // 3. CREATE NEW TASK OR SUBTASK WITH FULL PARAMETERS
    @Transactional
    public Task createTask(Task task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId("t-" + UUID.randomUUID().toString());
        }

        // Automatic Start Date & End Date span validation
        long spanDays = calculateTotalSpanDays(task.getStartDate(), task.getEndDate());
        if (task.getTargetCount() == null || task.getTargetCount() <= 0) {
            task.setTargetCount((int) spanDays);
        }

        return taskRepository.save(task);
    }

    // 4. LOG DAILY TASK COMPLETION WITH OPTIONAL QUANTITATIVE MEASURE VALUE
    @Transactional
    public Task logDailyTaskCompletion(String taskId, String userId, Double customMeasureValue) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        int target = task.getTargetCount() != null ? task.getTargetCount() : 50;
        int nextCount = Math.min(target, (task.getCurrentCount() != null ? task.getCurrentCount() : 0) + 1);
        int nextProg = (int) Math.round(((double) nextCount / target) * 100);

        task.setCurrentCount(nextCount);
        task.setProgressPercent(nextProg);

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

    // 5. EVALUATE PARENT TURN COMPLETION DRIVEN BY CHILD SUBTASKS
    @Transactional
    public void evaluateParentTaskCompletion(String parentTaskId, String userId) {
        Task parentTask = taskRepository.findById(parentTaskId).orElse(null);
        if (parentTask == null) return;

        List<Task> childTasks = taskRepository.findByParentTaskId(parentTaskId);
        if (childTasks.isEmpty()) return;

        boolean allCompleted = childTasks.stream()
                .allMatch(c -> c.getProgressPercent() != null && c.getProgressPercent() >= 100);

        int targetMax = parentTask.getTargetCount() != null ? parentTask.getTargetCount() : 45;
        int current = parentTask.getCurrentCount() != null ? parentTask.getCurrentCount() : 0;

        if (allCompleted) {
            if (current == 0) current = 1;
        }

        int parentProg = (int) Math.round(((double) current / targetMax) * 100);
        parentTask.setCurrentCount(current);
        parentTask.setProgressPercent(parentProg);

        taskRepository.save(parentTask);
    }

    // 6. SUBTASK LIFECYCLE EVALUATOR ENGINE
    private List<Task> processSubtaskLifecycles(List<Task> rawTasks) {
        LocalDate today = LocalDate.now();

        // Rule A & B: Unmap subtasks if parent ended or subtask ended before parent
        for (Task task : rawTasks) {
            if (task.getParentTaskId() != null && !task.getParentTaskId().isEmpty()) {
                Task parent = rawTasks.stream()
                        .filter(p -> p.getId().equals(task.getParentTaskId()))
                        .findFirst()
                        .orElse(null);

                if (parent == null || Boolean.TRUE.equals(parent.getIsArchived())) {
                    task.setParentTaskId("");
                } else if (task.getEndDate() != null && task.getEndDate().isBefore(today) && parent.getEndDate() != null && !parent.getEndDate().isBefore(today)) {
                    task.setParentTaskId("");
                }
            }
        }

        return rawTasks;
    }
}
