package com.anonymous.autovolume

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class AutoVolumeAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != AutoVolumeBackgroundConfig.ACTION_ALARM_TRIGGERED) {
      return
    }

    if (!AutoVolumeBackgroundConfig.isActive(context)) {
      AutoVolumeBackgroundConfig.cancelAlarm(context)
      return
    }

    AutoVolumeBackgroundConfig.applyTargetVolume(context)
    AutoVolumeBackgroundConfig.clearExecuteAt(context)

    val serviceIntent = Intent(context, AutoVolumeForegroundService::class.java).apply {
      action = AutoVolumeBackgroundConfig.ACTION_ALARM_TRIGGERED
    }

    ContextCompat.startForegroundService(context, serviceIntent)
  }
}
