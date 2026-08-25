package com.habithacker.repository;

import com.habithacker.entity.TaskArchiveLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskArchiveLogRepository extends JpaRepository<TaskArchiveLog, String> {
    List<TaskArchiveLog> findByTaskIdOrderByArchivedAtDesc(String taskId);
    Optional<TaskArchiveLog> findFirstByTaskIdAndUnarchivedAtIsNullOrderByArchivedAtDesc(String taskId);
}
