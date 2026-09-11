package com.habithacker.repository;

import com.habithacker.entity.DiarySecurityConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiarySecurityConfigRepository extends JpaRepository<DiarySecurityConfig, String> {
    Optional<DiarySecurityConfig> findByUserId(String userId);
}
