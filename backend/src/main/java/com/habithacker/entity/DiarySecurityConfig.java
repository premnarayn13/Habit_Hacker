package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "diary_security_config")
public class DiarySecurityConfig {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "password_salt", nullable = false, length = 255)
    private String passwordSalt;

    @Column(name = "lock_policy", length = 64)
    private String lockPolicy = "BACKGROUND";

    @Column(name = "inactivity_timeout_mins")
    private Integer inactivityTimeoutMins = 5;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public DiarySecurityConfig() {}

    public DiarySecurityConfig(String userId, String passwordHash, String passwordSalt, String lockPolicy, Integer inactivityTimeoutMins) {
        this.userId = userId;
        this.passwordHash = passwordHash;
        this.passwordSalt = passwordSalt;
        this.lockPolicy = lockPolicy != null ? lockPolicy : "BACKGROUND";
        this.inactivityTimeoutMins = inactivityTimeoutMins != null ? inactivityTimeoutMins : 5;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
        if (lockPolicy == null) lockPolicy = "BACKGROUND";
        if (inactivityTimeoutMins == null) inactivityTimeoutMins = 5;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getPasswordSalt() { return passwordSalt; }
    public void setPasswordSalt(String passwordSalt) { this.passwordSalt = passwordSalt; }

    public String getLockPolicy() { return lockPolicy; }
    public void setLockPolicy(String lockPolicy) { this.lockPolicy = lockPolicy; }

    public Integer getInactivityTimeoutMins() { return inactivityTimeoutMins; }
    public void setInactivityTimeoutMins(Integer inactivityTimeoutMins) { this.inactivityTimeoutMins = inactivityTimeoutMins; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
