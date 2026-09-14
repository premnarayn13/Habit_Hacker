# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 05: ANDROID APK PACKAGING & NATIVE PLUGINS SPECIFICATION

## 1. Android APK Build Architecture

Habit Hacker is packaged into an Android APK using **Capacitor**, providing native bridge access to Android hardware APIs (Local Notifications, Device Storage, Network Listeners, Share Sheet, and Hardware Back Button).

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              HABIT HACKER REACT WEB SHELL                               │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CAPACITOR NATIVE ANDROID BRIDGE                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • @capacitor/core                                                                       │
│ • @capacitor/android                                                                    │
│ • @capacitor/local-notifications                                                        │
│ • @capacitor/network                                                                    │
│ • @capacitor/share                                                                      │
│ • @capacitor/status-bar                                                                 │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                ANDROID NATIVE OS (APK)                                  │
│ • Android AlarmManager & NotificationService                                            │
│ • SQLite / WebView IndexedDB Engine                                                     │
│ • Hardware Back-Button Event Listener                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Android Manifest Permissions (`AndroidManifest.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.habithacker.app">

    <!-- Required for Network Sync Engine -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Required for Device-Local Reminder Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- Application Definition -->
    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Habit Hacker"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name="com.habithacker.app.MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="Habit Hacker"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBar">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 3. Capacitor Configuration (`capacitor.config.json`)

```json
{
  "appId": "com.habithacker.app",
  "appName": "Habit Hacker",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "LocalNotifications": {
      "smallIcon": "ic_stat_icon_config",
      "iconColor": "#DC2626",
      "sound": "beep.wav"
    },
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#FFFFFF",
      "showSpinner": false
    }
  },
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
```

---

## 4. Native Local Notification Implementation

```javascript
import { LocalNotifications } from '@capacitor/local-notifications';

export async function scheduleNativeNotification(todo) {
  if (!todo.reminderDate || !todo.reminderTime) return;

  const scheduledDate = new Date(`${todo.reminderDate}T${todo.reminderTime}:00`);

  // Request Permission
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return;

  const notifId = Math.floor(Math.random() * 1000000);

  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Habit Hacker Reminder 🔔',
        body: todo.title,
        id: notifId,
        schedule: { at: scheduledDate },
        sound: todo.ringtone === 'bell' ? 'bell.wav' : 'default',
        extra: { todoId: todo.id }
      }
    ]
  });

  return notifId;
}
```

---

## 5. APK Build Command Script (`package.json`)

```json
{
  "scripts": {
    "build:apk": "vite build && npx cap sync android && cd android && ./gradlew assembleDebug",
    "open:android": "npx cap open android"
  }
}
```
