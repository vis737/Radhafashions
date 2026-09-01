# Radha Admin - Android App

A standalone Android APK that wraps the Radha Fashions admin panel in a WebView.

## Features
- Loads `https://radhafashions.in/admin` directly
- Admin-only UI (hides customer storefront elements via CSS injection)
- Swipe-to-refresh
- Progress bar
- File upload support (for product images)
- Image download on long-press
- WhatsApp, phone, email link handling
- Back button navigation within WebView
- Network error handling with retry
- No internet detection
- Dark theme matching the website

## How to Build

### Option 1: Android Studio (Recommended)
1. Open Android Studio
2. Click "Open an existing project"
3. Navigate to the `android-admin/` folder
4. Wait for Gradle sync to complete
5. Click Build > Build Bundle(s) / APK(s) > Build APK(s)
6. The APK will be at `app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line
```bash
# Prerequisites: JDK 17+, Android SDK
cd android-admin

# If you don't have gradle wrapper:
gradle wrapper

# Build debug APK
./gradlew assembleDebug

# APK output:
# app/build/outputs/apk/debug/app-debug.apk
```

## Signing for Release
```bash
./gradlew assembleRelease
```
You'll need to create a keystore for signing. See: https://developer.android.com/studio/publish/app-signing

## Configuration
- **Admin URL**: Edit `MainActivity.java` → `ADMIN_URL` constant
- **Theme colors**: Edit `res/values/colors.xml`
- **App name**: Edit `res/values/strings.xml`
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
