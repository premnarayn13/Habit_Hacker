package com.habithacker.service;

import com.habithacker.entity.TaskCollaboration;
import com.habithacker.repository.TaskCollaborationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TaskCollaborationService {

    private final TaskCollaborationRepository collaborationRepository;

    public TaskCollaborationService(TaskCollaborationRepository collaborationRepository) {
        this.collaborationRepository = collaborationRepository;
    }

    public TaskCollaboration createInvite(String taskId, String taskTitle, String taskCategory, String taskPriority, String senderEmail, String senderName, String receiverEmail) {
        // Prevent duplicate pending invites for same task and receiver
        List<TaskCollaboration> existing = collaborationRepository.findByTaskIdAndReceiverEmail(taskId, receiverEmail);
        if (!existing.isEmpty()) {
            TaskCollaboration collab = existing.get(0);
            collab.setStatus("PENDING");
            collab.setUpdatedAt(LocalDateTime.now());
            return collaborationRepository.save(collab);
        }

        String id = "collab-" + UUID.randomUUID().toString().substring(0, 8);
        TaskCollaboration newCollab = new TaskCollaboration(id, taskId, taskTitle, taskCategory, taskPriority, senderEmail, senderName, receiverEmail);
        return collaborationRepository.save(newCollab);
    }

    public List<TaskCollaboration> getReceivedInvitations(String receiverEmail) {
        return collaborationRepository.findByReceiverEmailOrderByCreatedAtDesc(receiverEmail);
    }

    public List<TaskCollaboration> getSentRequests(String senderEmail) {
        return collaborationRepository.findBySenderEmailOrderByCreatedAtDesc(senderEmail);
    }

    public TaskCollaboration respondToInvitation(String id, String action) {
        return collaborationRepository.findById(id).map(collab -> {
            if ("ACCEPT".equalsIgnoreCase(action)) {
                collab.setStatus("ACCEPTED");
            } else if ("DECLINE".equalsIgnoreCase(action)) {
                collab.setStatus("DECLINED");
            }
            collab.setUpdatedAt(LocalDateTime.now());
            return collaborationRepository.save(collab);
        }).orElseThrow(() -> new RuntimeException("Collaboration invite not found: " + id));
    }
}
