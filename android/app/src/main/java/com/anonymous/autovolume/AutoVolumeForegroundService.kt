package com.anonymous.autovolume

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationManagerCompat

class AutoVolumeForegroundService : Service() {
  private var ignoreVolumeEventsUntil = 0L

  private val volumeReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
      if (intent?.action != AutoVolumeBackgroundConfig.ACTION_VOLUME_CHANGED) {
        return
      }

      if (!AutoVolumeBackgroundConfig.isActive(context)) {
        return
      }

      if (System.currentTimeMillis() < ignoreVolumeEventsUntil) {
        return
      }

      val timerMs = AutoVolumeBackgroundConfig.getTimerMs(context)
      if (timerMs <= 0) {
        AutoVolumeBackgroundConfig.cancelAlarm(context)
        updateNotification()
        return
      }

      val executeAt = System.currentTimeMillis() + timerMs
      AutoVolumeBackgroundConfig.scheduleAlarm(context, executeAt)
      updateNotification(executeAt)
    }
  }

  override fun onCreate() {
    super.onCreate()

    val filter = IntentFilter(AutoVolumeBackgroundConfig.ACTION_VOLUME_CHANGED)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(volumeReceiver, filter, RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(volumeReceiver, filter)
    }
  }

  override fun onDestroy() {
    unregisterReceiver(volumeReceiver)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      AutoVolumeBackgroundConfig.ACTION_STOP -> {
        AutoVolumeBackgroundConfig.cancelAlarm(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }

      AutoVolumeBackgroundConfig.ACTION_ALARM_TRIGGERED -> {
        ignoreVolumeEventsUntil = System.currentTimeMillis() + 1500
        updateNotification()
      }
    }

    if (!AutoVolumeBackgroundConfig.isActive(this)) {
      AutoVolumeBackgroundConfig.cancelAlarm(this)
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return START_NOT_STICKY
    }

    startForeground(
      AutoVolumeBackgroundConfig.NOTIFICATION_ID,
      AutoVolumeBackgroundConfig.buildNotification(this),
    )

    return START_STICKY
  }

  private fun updateNotification(executeAt: Long = AutoVolumeBackgroundConfig.getExecuteAt(this)) {
    NotificationManagerCompat.from(this).notify(
      AutoVolumeBackgroundConfig.NOTIFICATION_ID,
      AutoVolumeBackgroundConfig.buildNotification(this, executeAt),
    )
  }
}
