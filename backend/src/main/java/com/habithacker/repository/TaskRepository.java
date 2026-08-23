package com.habithacker.repository;

import com.habithacker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByUserId(String userId);
    List<Task> findByUserIdAndIsArchived(String userId, Boolean isArchived);
    List<Task> findByParentTaskId(String parentTaskId);
}
