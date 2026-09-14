package com.habithacker.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    private String userId;

    @Column(name = "display_name", length = 255)
    private String displayName = "Prem Narayn";

    @Column(name = "email", nullable = false, length = 255)
    private String email = "prem.narayn@habithacker.app";

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "capacity_hours")
    private Integer capacityHours = 8;

    @Column(name = "week_start_day", length = 32)
    private String weekStartDay = "Monday";

    @Column(name = "date_format", length = 32)
    private String dateFormat = "YYYY-MM-DD";

    @Column(name = "theme", length = 32)
    private String theme = "light";

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "sound_alerts")
    private Boolean soundAlerts = true;

    @Column(name = "habit_reminders")
    private Boolean habitReminders = true;

    @Column(name = "todo_notifications")
    private Boolean todoNotifications = true;

    @Column(name = "ringtone_name", length = 128)
    private String ringtoneName = "Default Bell";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public UserSettings() {}

    public UserSettings(String id, String userId, String displayName, String email) {
        this.id = id;
        this.userId = userId;
        this.displayName = displayName;
        this.email = email;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Integer getCapacityHours() { return capacityHours; }
    public void setCapacityHours(Integer capacityHours) { this.capacityHours = capacityHours; }

    public String getWeekStartDay() { return weekStartDay; }
    public void setWeekStartDay(String weekStartDay) { this.weekStartDay = weekStartDay; }

    public String getDateFormat() { return dateFormat; }
    public void setDateFormat(String dateFormat) { this.dateFormat = dateFormat; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public Boolean getSoundAlerts() { return soundAlerts; }
    public void setSoundAlerts(Boolean soundAlerts) { this.soundAlerts = soundAlerts; }

    public Boolean getHabitReminders() { return habitReminders; }
    public void setHabitReminders(Boolean habitReminders) { this.habitReminders = habitReminders; }

    public Boolean getTodoNotifications() { return todoNotifications; }
    public void setTodoNotifications(Boolean todoNotifications) { this.todoNotifications = todoNotifications; }

    public String getRingtoneName() { return ringtoneName; }
    public void setRingtoneName(String ringtoneName) { this.ringtoneName = ringtoneName; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
