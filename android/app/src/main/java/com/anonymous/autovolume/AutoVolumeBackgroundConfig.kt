package com.anonymous.autovolume

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object AutoVolumeBackgroundConfig {
  const val PREFS_NAME = "auto_volume_background"
  const val CHANNEL_ID = "auto_volume_background_service"
  const val NOTIFICATION_ID = 62041

  const val KEY_IS_ACTIVE = "isActive"
  const val KEY_TIMER_MS = "timerMs"
  const val KEY_TARGET_VOLUME = "targetVolume"
  const val KEY_EXECUTE_AT = "executeAt"

  const val ACTION_START_OR_UPDATE = "com.anonymous.autovolume.START_OR_UPDATE"
  const val ACTION_STOP = "com.anonymous.autovolume.STOP"
  const val ACTION_ALARM_TRIGGERED = "com.anonymous.autovolume.ALARM_TRIGGERED"
  const val ACTION_VOLUME_CHANGED = "android.media.VOLUME_CHANGED_ACTION"

  fun saveConfig(context: Context, isActive: Boolean, timerMs: Long, targetVolume: Int) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putBoolean(KEY_IS_ACTIVE, isActive)
      .putLong(KEY_TIMER_MS, timerMs)
      .putInt(KEY_TARGET_VOLUME, targetVolume.coerceIn(0, 100))
      .apply()
  }

  fun clearExecuteAt(context: Context) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putLong(KEY_EXECUTE_AT, 0)
      .apply()
  }

  fun getExecuteAt(context: Context): Long {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getLong(KEY_EXECUTE_AT, 0)
  }

  fun getTimerMs(context: Context): Long {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getLong(KEY_TIMER_MS, 0)
      .coerceAtLeast(0)
  }

  fun getTargetVolume(context: Context): Int {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getInt(KEY_TARGET_VOLUME, 0)
      .coerceIn(0, 100)
  }

  fun isActive(context: Context): Boolean {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getBoolean(KEY_IS_ACTIVE, false)
  }

  fun scheduleAlarm(context: Context, executeAt: Long) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putLong(KEY_EXECUTE_AT, executeAt)
      .apply()

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val pendingIntent = buildAlarmPendingIntent(context)

    alarmManager.cancel(pendingIntent)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms()) {
      alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, executeAt, pendingIntent)
      return
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, executeAt, pendingIntent)
      return
    }

    alarmManager.set(AlarmManager.RTC_WAKEUP, executeAt, pendingIntent)
  }

  fun cancelAlarm(context: Context) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(buildAlarmPendingIntent(context))
    clearExecuteAt(context)
  }

  fun applyTargetVolume(context: Context) {
    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val targetVolume = getTargetVolume(context)
    val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    val streamVolume = ((targetVolume / 100f) * maxVolume).toInt().coerceIn(0, maxVolume)

    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, streamVolume, 0)
  }

  fun buildNotification(context: Context, executeAt: Long = getExecuteAt(context)): Notification {
    ensureNotificationChannel(context)

    val contentText = if (executeAt > System.currentTimeMillis()) {
      val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
      "Volume scheduled for ${formatter.format(Date(executeAt))}"
    } else {
      "Listening for volume changes..."
    }

    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val contentIntent = PendingIntent.getActivity(
      context,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    return NotificationCompat.Builder(context, CHANNEL_ID)
      .setContentTitle("Volume Timer")
      .setContentText(contentText)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  fun ensureNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager = ContextCompat.getSystemService(context, NotificationManager::class.java) ?: return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Volume Timer",
      NotificationManager.IMPORTANCE_LOW,
    ).apply {
      description = "Keeps volume monitoring active in the background"
    }

    manager.createNotificationChannel(channel)
  }

  private fun buildAlarmPendingIntent(context: Context): PendingIntent {
    val intent = Intent(context, AutoVolumeAlarmReceiver::class.java).apply {
      action = ACTION_ALARM_TRIGGERED
    }

    return PendingIntent.getBroadcast(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
