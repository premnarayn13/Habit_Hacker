# HABIT HACKER DIARY SYSTEM — 06: BACKEND & SUPABASE METADATA SCHEMA SPECIFICATION

## 1. Supabase PostgreSQL Migration Script (`SUPABASE_DIARY_METADATA_SCHEMA.sql`)

> ⚠️ **CRITICAL PRIVACY RULE**:
> This schema creates tables for **Diary Metadata and Auth Verification ONLY**.
> There is **NO** `content`, `body`, or `text` column in any server table. All actual text entries reside strictly within the user's mobile device IndexedDB storage.

```sql
-- ============================================================================
-- HABIT HACKER DIARY METADATA & SECURITY SCHEMA WITH DEFAULT SEED DATA
-- EXECUTE THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Create Diary Metadata Table (Metadata Only — Content text remains 100% device-local)
CREATE TABLE IF NOT EXISTS public.diary_metadata (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'CUSTOM',
    icon VARCHAR(64) DEFAULT 'BookOpen',
    is_locked BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Diary Password Security Metadata Table
CREATE TABLE IF NOT EXISTS public.diary_security_config (
    user_id VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    lock_policy VARCHAR(64) DEFAULT 'BACKGROUND',
    inactivity_timeout_mins INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diary_meta_user ON public.diary_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_meta_type ON public.diary_metadata(type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.diary_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_security_config ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Public access to diary metadata" ON public.diary_metadata;
CREATE POLICY "Public access to diary metadata" ON public.diary_metadata FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access to diary security config" ON public.diary_security_config;
CREATE POLICY "Public access to diary security config" ON public.diary_security_config FOR ALL USING (true);

-- ============================================================================
-- 6. FIVE DEFAULT DIARIES SEEDING FUNCTION & INITIAL DATA INSERTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.seed_default_user_diary_metadata(target_user_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES 
        ('diary-lessons-' || target_user_id, target_user_id, 'Today''s Lessons', 'DAILY_LESSONS', 'Lightbulb', FALSE, 1),
        ('diary-proverb-' || target_user_id, target_user_id, 'Today''s Proverb', 'PROVERB', 'Quote', FALSE, 2),
        ('diary-story-' || target_user_id, target_user_id, 'Today''s Story', 'STORY_HUB', 'BookOpen', FALSE, 3),
        ('diary-events-' || target_user_id, target_user_id, 'Daily Day Events', 'DAILY_EVENTS', 'Calendar', FALSE, 4),
        ('diary-personal-' || target_user_id, target_user_id, 'Personal Diary', 'PERSONAL_JOURNAL', 'Lock', TRUE, 5)
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute Seed Function for System Accounts
SELECT public.seed_default_user_diary_metadata('default_user');
SELECT public.seed_default_user_diary_metadata('demo_user');

-- Direct SQL Insert Seed Records for Master Admin User
INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
VALUES 
    ('diary-meta-1', '00000000-0000-0000-0000-000000000000', 'Today''s Lessons', 'DAILY_LESSONS', 'Lightbulb', FALSE, 1),
    ('diary-meta-2', '00000000-0000-0000-0000-000000000000', 'Today''s Proverb', 'PROVERB', 'Quote', FALSE, 2),
    ('diary-meta-3', '00000000-0000-0000-0000-000000000000', 'Today''s Story', 'STORY_HUB', 'BookOpen', FALSE, 3),
    ('diary-meta-4', '00000000-0000-0000-0000-000000000000', 'Daily Day Events', 'DAILY_EVENTS', 'Calendar', FALSE, 4),
    ('diary-meta-5', '00000000-0000-0000-0000-000000000000', 'Personal Diary', 'PERSONAL_JOURNAL', 'Lock', TRUE, 5)
ON CONFLICT (id) DO NOTHING;
```

---

## 2. Spring Boot Java Entity Models

### `DiaryMetadata.java`
```java
package com.habithacker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "diary_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryMetadata {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "type", nullable = false, length = 64)
    private String type;

    @Column(name = "icon", length = 64)
    private String icon;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
```

### `DiarySecurityConfig.java`
```java
package com.habithacker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "diary_security_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiarySecurityConfig {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "password_salt", nullable = false, length = 255)
    private String passwordSalt;

    @Column(name = "lock_policy", length = 64)
    private String lockPolicy;

    @Column(name = "inactivity_timeout_mins")
    private Integer inactivityTimeoutMins;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
```

---

## 3. Spring Boot REST Controller (`DiaryMetadataController.java`)

```java
package com.habithacker.controller;

import com.habithacker.entity.DiaryMetadata;
import com.habithacker.entity.DiarySecurityConfig;
import com.habithacker.repository.DiaryMetadataRepository;
import com.habithacker.repository.DiarySecurityConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(metadataRepository.findByUserIdOrderByDisplayOrderAsc(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<DiaryMetadata> saveDiaryMetadata(
            @PathVariable String userId,
            @RequestBody DiaryMetadata metadata) {
        metadata.setUserId(userId);
        return ResponseEntity.ok(metadataRepository.save(metadata));
    }

    @GetMapping("/security/{userId}")
    public ResponseEntity<DiarySecurityConfig> getSecurityConfig(@PathVariable String userId) {
        return securityRepository.findById(userId)
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
```
