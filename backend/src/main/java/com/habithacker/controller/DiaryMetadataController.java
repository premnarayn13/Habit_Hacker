package com.habithacker.controller;

import com.habithacker.entity.DiaryMetadata;
import com.habithacker.entity.DiarySecurityConfig;
import com.habithacker.repository.DiaryMetadataRepository;
import com.habithacker.repository.DiarySecurityConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/diary/metadata")
@CrossOrigin(origins = "*")
public class DiaryMetadataController {

    @Autowired
    private DiaryMetadataRepository metadataRepository;

    @Autowired
    private DiarySecurityConfigRepository securityRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<DiaryMetadata>> getUserDiaryMetadata(@PathVariable String userId) {
        List<DiaryMetadata> list = metadataRepository.findByUserIdOrderByDisplayOrderAsc(userId);
        if (list.isEmpty()) {
            // Auto seed default 5 diaries metadata for user
            List<DiaryMetadata> defaultDiaries = Arrays.asList(
                new DiaryMetadata("diary-lessons-" + userId, userId, "Today's Lessons", "DAILY_LESSONS", "Lightbulb", false, 1),
                new DiaryMetadata("diary-proverb-" + userId, userId, "Today's Proverb", "PROVERB", "Quote", false, 2),
                new DiaryMetadata("diary-story-" + userId, userId, "Today's Story", "STORY_HUB", "BookOpen", false, 3),
                new DiaryMetadata("diary-events-" + userId, userId, "Daily Day Events", "DAILY_EVENTS", "Calendar", false, 4),
                new DiaryMetadata("diary-personal-" + userId, userId, "Personal Diary", "PERSONAL_JOURNAL", "Lock", true, 5)
            );
            list = metadataRepository.saveAll(defaultDiaries);
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<DiaryMetadata> saveDiaryMetadata(
            @PathVariable String userId,
            @RequestBody DiaryMetadata metadata) {
        metadata.setUserId(userId);
        return ResponseEntity.ok(metadataRepository.save(metadata));
    }

    @DeleteMapping("/{userId}/{diaryId}")
    public ResponseEntity<Void> deleteDiaryMetadata(
            @PathVariable String userId,
            @PathVariable String diaryId) {
        metadataRepository.deleteById(diaryId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/security/{userId}")
    public ResponseEntity<DiarySecurityConfig> getSecurityConfig(@PathVariable String userId) {
        return securityRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/security/{userId}")
    public ResponseEntity<DiarySecurityConfig> saveSecurityConfig(
            @PathVariable String userId,
            @RequestBody DiarySecurityConfig config) {
        config.setUserId(userId);
        return ResponseEntity.ok(securityRepository.save(config));
    }
}
