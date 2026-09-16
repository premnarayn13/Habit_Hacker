package com.habithacker.controller;

import com.habithacker.entity.TaskCollaboration;
import com.habithacker.service.TaskCollaborationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/collaborations")
@CrossOrigin(origins = "*")
public class TaskCollaborationController {

    private final TaskCollaborationService collaborationService;

    public TaskCollaborationController(TaskCollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @PostMapping("/invite")
    public ResponseEntity<TaskCollaboration> createInvite(@RequestBody Map<String, Object> body) {
        String taskId = (String) body.getOrDefault("taskId", "task-" + System.currentTimeMillis());
        String taskTitle = (String) body.getOrDefault("taskTitle", "Collaborative Habit");
        String taskCategory = (String) body.getOrDefault("category", "General");
        String taskPriority = (String) body.getOrDefault("priority", "HIGH");
        String senderEmail = (String) body.getOrDefault("senderEmail", "user@habithacker.app");
        String senderName = (String) body.getOrDefault("senderName", "Habit Hacker User");
        String receiverEmail = (String) body.getOrDefault("receiverEmail", "");

        if (receiverEmail.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        TaskCollaboration invite = collaborationService.createInvite(
            taskId, taskTitle, taskCategory, taskPriority, senderEmail, senderName, receiverEmail
        );
        return ResponseEntity.ok(invite);
    }

    @GetMapping("/received")
    public ResponseEntity<List<TaskCollaboration>> getReceived(@RequestParam String email) {
        return ResponseEntity.ok(collaborationService.getReceivedInvitations(email));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<TaskCollaboration>> getSent(@RequestParam String email) {
        return ResponseEntity.ok(collaborationService.getSentRequests(email));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<TaskCollaboration> respond(@PathVariable String id, @RequestParam String action) {
        TaskCollaboration updated = collaborationService.respondToInvitation(id, action);
        return ResponseEntity.ok(updated);
    }
}
