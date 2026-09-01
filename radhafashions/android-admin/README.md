# Radha Admin - Android App

Standalone Android admin panel for Radha Fashions with **real-time order notifications**.

## Features
- WebView-based admin panel at `https://radhafashions.in/admin`
- **Order notifications**: Polls `/api/orders` every 30 seconds and shows native Android notifications when new orders arrive
- **Dual notification system**: JavaScript injection + foreground service for reliability
- **Boot persistence**: Restart order monitoring after device reboot
- Swipe-to-refresh, file upload support, image download
- Auto-injects admin CSS to hide customer UI elements

## How Order Notifications Work

### Two-Layer System:

1. **JavaScript Polling** (primary): After the admin panel loads, JavaScript is injected into the WebView that polls `/api/orders` every 30 seconds using the admin session cookie. When new orders are detected, it calls `AndroidBridge.onNewOrderCount()` which triggers a native notification.

2. **Foreground Service** (backup): A background `OrderPollingService` runs as a foreground service with a persistent "Monitoring for new orders..." notification. It uses `CookieManager` to access the same admin cookies as the WebView and polls independently.

Both systems share `SharedPreferences` to stay in sync and avoid duplicate notifications.

### Permissions Required:
- `POST_NOTIFICATIONS` (Android 13+) - Requested on first launch
- `INTERNET` - For API calls
- `FOREGROUND_SERVICE` - For background polling
- `RECEIVE_BOOT_COMPLETED` - To restart monitoring after reboot

## Build Instructions

### Prerequisites:
- Android Studio (latest stable)
- JDK 17

### Steps:
1. Open Android Studio
2. File → Open → select the `android-admin/` folder
3. Wait for Gradle sync to complete
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. APK output: `app/build/outputs/apk/debug/app-debug.apk`

### For Release Build:
1. Build → Generate Signed Bundle / APK
2. Create or select a keystore
3. Choose release build type
4. Signed APK: `app/build/outputs/apk/release/app-release.apk`

## Project Structure
```
android-admin/
├── build.gradle                  # Root Gradle config
├── settings.gradle               # Project settings
├── gradle.properties             # Build properties
├── README.md
└── app/
    ├── build.gradle              # App config (minSdk 24, targetSdk 34)
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/radhafashions/admin/
        │   ├── MainActivity.java         # WebView + JS bridge
        │   ├── NotificationHelper.java   # Notification channels & display
        │   ├── OrderPollingService.java  # Foreground polling service
        │   └── BootReceiver.java         # Restart on device boot
        └── res/
            ├── drawable/
            │   ├── ic_notification.xml
            │   └── ic_launcher_foreground.xml
            ├── layout/activity_main.xml
            ├── values/
            │   ├── colors.xml
            │   ├── strings.xml
            │   └── themes.xml
            └── xml/network_security_config.xml
```

## Target Android Versions
- Minimum: Android 7.0 (API 24)
- Target: Android 14 (API 34)
