package com.habithacker.repository;

import com.habithacker.entity.TaskLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {
    List<TaskLog> findByTaskId(String taskId);
    List<TaskLog> findByUserId(String userId);
    List<TaskLog> findByTaskIdAndLoggedAtBetween(String taskId, LocalDateTime start, LocalDateTime end);
}
