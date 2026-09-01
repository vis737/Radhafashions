package com.radhafashions.admin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

public class NotificationHelper {
    private static final String CHANNEL_ID = "radha_order_notifications";
    private static final String CHANNEL_NAME = "New Orders";
    private static int NOTIFICATION_ID = 1001;

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = context.getSystemService(NotificationManager.class);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
                channel.setDescription("Notifications for new incoming orders");
                channel.enableLights(true);
                channel.setLightColor(0xFFE91E63);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 300, 200, 300});
                Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
                channel.setSound(sound, attrs);
                nm.createNotificationChannel(channel);
            }
        }
    }

    public static void showOrderNotification(Context context, int previousCount, int newCount) {
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null) return;
        createNotificationChannel(context);

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        int diff = newCount - previousCount;
        String title = diff == 1 ? "New Order Received!" : diff + " New Orders Received!";
        String body = "You have " + diff + " new order" + (diff > 1 ? "s" : "")
            + ". Total: " + newCount + " orders. Tap to view.";

        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(context, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(context);
        }

        Notification notification = builder
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new Notification.BigTextStyle().bigText(body))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setSound(sound)
            .setVibrate(new long[]{0, 300, 200, 300})
            .setDefaults(Notification.DEFAULT_LIGHTS)
            .build();

        nm.notify(NOTIFICATION_ID++, notification);
    }
}
