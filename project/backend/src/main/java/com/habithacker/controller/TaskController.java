package com.habithacker.controller;

import com.habithacker.entity.Task;
import com.habithacker.entity.TaskLog;
import com.habithacker.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // GET /api/tasks?userId=demo-user-123
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@RequestParam(defaultValue = "demo-user-123") String userId) {
        List<Task> tasks = taskService.getUserTasks(userId);
        return ResponseEntity.ok(tasks);
    }

    // POST /api/tasks
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task created = taskService.createTask(task);
        return ResponseEntity.ok(created);
    }

    // PUT /api/tasks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task updatedData) {
        Task updated = taskService.updateTask(id, updatedData);
        return ResponseEntity.ok(updated);
    }

    // POST /api/tasks/{id}/toggle?userId=demo-user-123&measuredValue=10.0
    @PostMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskCompletion(
            @PathVariable String id,
            @RequestParam(defaultValue = "demo-user-123") String userId,
            @RequestParam(required = false) Double measuredValue) {
        Task updated = taskService.logDailyTaskCompletion(id, userId, measuredValue);
        return ResponseEntity.ok(updated);
    }

    // POST /api/tasks/{id}/undo?userId=demo-user-123
    @PostMapping("/{id}/undo")
    public ResponseEntity<Task> undoTaskCompletion(
            @PathVariable String id,
            @RequestParam(defaultValue = "demo-user-123") String userId) {
        Task updated = taskService.undoTaskCompletion(id, userId);
        return ResponseEntity.ok(updated);
    }

    // POST /api/tasks/{id}/archive
    @PostMapping("/{id}/archive")
    public ResponseEntity<Task> toggleArchiveTask(@PathVariable String id) {
        Task updated = taskService.toggleArchiveTask(id);
        return ResponseEntity.ok(updated);
    }

    // POST /api/tasks/{id}/map-parent?parentTaskId=t-default-1
    @PostMapping("/{id}/map-parent")
    public ResponseEntity<Task> mapParentTask(@PathVariable String id, @RequestParam(required = false) String parentTaskId) {
        Task updated = taskService.mapParentTask(id, parentTaskId);
        return ResponseEntity.ok(updated);
    }

    // GET /api/tasks/{id}/measures
    @GetMapping("/{id}/measures")
    public ResponseEntity<List<TaskLog>> getTaskMeasureHistory(@PathVariable String id) {
        List<TaskLog> history = taskService.getTaskMeasureHistory(id);
        return ResponseEntity.ok(history);
    }
}
