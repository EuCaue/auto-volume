#!/usr/bin/env bash

set -e

if ! adb devices | grep -q "emulator"; then
  echo "🚀 Starting Android emulator..."
  QT_QPA_PLATFORM=xcb emulator -avd pixel >/dev/null 2>&1 &

  echo "⏳ Waiting for emulator to boot..."
  adb wait-for-device

  while [[ "$(adb shell getprop sys.boot_completed | tr -d '\r')" != "1" ]]; do
    sleep 2
  done

  echo "✅ Emulator is ready"
else
  echo "📱 Emulator already running"
fi

bunx expo run:android
