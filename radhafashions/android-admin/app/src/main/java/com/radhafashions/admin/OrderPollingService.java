package com.radhafashions.admin;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.webkit.CookieManager;

public class OrderPollingService extends Service {
    private static final String TAG = "OrderPolling";
    private static final String BASE_URL = "https://radhafashions.in";
    private static final String PREFS_NAME = "radha_admin_prefs";
    private static final String KEY_LAST_ORDER_COUNT = "last_order_count";
    private static final long POLL_INTERVAL_MS = 30000; // 30 seconds

    private Handler handler;
    private ExecutorService executor;
    private boolean isRunning = false;
    private int lastKnownCount = -1;

    private final Runnable pollRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isRunning) return;
            pollForOrders();
            handler.postDelayed(this, POLL_INTERVAL_MS);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        handler = new Handler(Looper.getMainLooper());
        executor = Executors.newSingleThreadExecutor();
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        lastKnownCount = prefs.getInt(KEY_LAST_ORDER_COUNT, -1);
        Log.d(TAG, "Service created. Last known count: " + lastKnownCount);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service started");
        startForeground(1, buildForegroundNotification());
        isRunning = true;
        handler.removeCallbacks(pollRunnable);
        handler.post(pollRunnable);
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        isRunning = false;
        handler.removeCallbacks(pollRunnable);
        executor.shutdownNow();
        Log.d(TAG, "Service destroyed");
        super.onDestroy();
    }

    private void pollForOrders() {
        executor.execute(() -> {
            try {
                String cookies = CookieManager.getInstance().getCookie(BASE_URL);
                if (cookies == null || cookies.isEmpty()) {
                    Log.d(TAG, "No admin cookies found. Waiting for login...");
                    return;
                }

                URL url = new URL(BASE_URL + "/api/orders");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setRequestProperty("Cookie", cookies);
                conn.setRequestProperty("Accept", "application/json");

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close();
                    conn.disconnect();

                    String body = sb.toString().trim();
                    // Count orders: each order has an "orderNumber" field
                    int currentCount = 0;
                    int idx = 0;
                    while ((idx = body.indexOf("orderNumber", idx)) != -1) {
                        currentCount++;
                        idx += 11;
                    }

                    Log.d(TAG, "Polled orders: count=" + currentCount + " lastKnown=" + lastKnownCount);

                    if (lastKnownCount >= 0 && currentCount > lastKnownCount) {
                        final int prev = lastKnownCount;
                        final int curr = currentCount;
                        handler.post(() -> {
                            NotificationHelper.showOrderNotification(
                                OrderPollingService.this, prev, curr);
                        });
                    }

                    lastKnownCount = currentCount;
                    SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    prefs.edit().putInt(KEY_LAST_ORDER_COUNT, currentCount).apply();

                } else if (responseCode == 401) {
                    Log.d(TAG, "Admin session expired. Waiting for re-login...");
                } else {
                    Log.w(TAG, "Orders API returned " + responseCode);
                }
            } catch (Exception e) {
                Log.e(TAG, "Poll failed: " + e.getMessage());
            }
        });
    }

    private Notification buildForegroundNotification() {
        NotificationHelper.createNotificationChannel(this);
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder builder;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, "radha_order_notifications");
        } else {
            builder = new Notification.Builder(this);
        }

        return builder
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Radha Admin")
            .setContentText("Monitoring for new orders...")
            .setContentIntent(pi)
            .setOngoing(true)
            .build();
    }
}
