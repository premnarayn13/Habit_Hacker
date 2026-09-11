package com.habithacker.repository;

import com.habithacker.entity.DiaryMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryMetadataRepository extends JpaRepository<DiaryMetadata, String> {
    List<DiaryMetadata> findByUserIdOrderByDisplayOrderAsc(String userId);
    List<DiaryMetadata> findByUserIdAndType(String userId, String type);
}
