package com.habithacker.controller;

import com.habithacker.entity.Task;
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

    // GET /api/tasks?userId=123
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

    // POST /api/tasks/{id}/toggle?userId=123&measuredValue=10.0
    @PostMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskCompletion(
            @PathVariable String id,
            @RequestParam(defaultValue = "demo-user-123") String userId,
            @RequestParam(required = false) Double measuredValue) {
        Task updated = taskService.logDailyTaskCompletion(id, userId, measuredValue);
        return ResponseEntity.ok(updated);
    }
}
