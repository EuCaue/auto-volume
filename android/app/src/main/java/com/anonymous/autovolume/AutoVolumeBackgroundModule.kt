package com.anonymous.autovolume

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class AutoVolumeBackgroundModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AutoVolumeBackground"

  @ReactMethod
  fun startOrUpdate(config: ReadableMap, promise: Promise) {
    try {
      val isActive = config.getBoolean("isActive")
      val timerMs = config.getDouble("timerMs").toLong().coerceAtLeast(0)
      val targetVolume = config.getDouble("targetVolume").toInt().coerceIn(0, 100)

      AutoVolumeBackgroundConfig.saveConfig(reactContext, isActive, timerMs, targetVolume)

      if (!isActive) {
        stop(promise)
        return
      }

      val intent = Intent(reactContext, AutoVolumeForegroundService::class.java).apply {
        action = AutoVolumeBackgroundConfig.ACTION_START_OR_UPDATE
      }

      ContextCompat.startForegroundService(reactContext, intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("AUTO_VOLUME_START_FAILED", error)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      AutoVolumeBackgroundConfig.saveConfig(reactContext, false, 0, AutoVolumeBackgroundConfig.getTargetVolume(reactContext))
      AutoVolumeBackgroundConfig.cancelAlarm(reactContext)

      val intent = Intent(reactContext, AutoVolumeForegroundService::class.java).apply {
        action = AutoVolumeBackgroundConfig.ACTION_STOP
      }

      reactContext.startService(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("AUTO_VOLUME_STOP_FAILED", error)
    }
  }
}
