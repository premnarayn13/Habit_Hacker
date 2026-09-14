package com.habithacker.repository;

import com.habithacker.entity.SubtaskLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubtaskLogRepository extends JpaRepository<SubtaskLog, String> {
    List<SubtaskLog> findByParentTaskId(String parentTaskId);
    List<SubtaskLog> findBySubtaskId(String subtaskId);
    List<SubtaskLog> findByParentTaskIdAndLogDate(String parentTaskId, LocalDate logDate);
}
