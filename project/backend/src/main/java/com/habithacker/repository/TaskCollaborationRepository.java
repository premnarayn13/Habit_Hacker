package com.habithacker.repository;

import com.habithacker.entity.TaskCollaboration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCollaborationRepository extends JpaRepository<TaskCollaboration, String> {
    List<TaskCollaboration> findByReceiverEmailOrderByCreatedAtDesc(String receiverEmail);
    List<TaskCollaboration> findBySenderEmailOrderByCreatedAtDesc(String senderEmail);
    List<TaskCollaboration> findByTaskIdAndReceiverEmail(String taskId, String receiverEmail);
}
