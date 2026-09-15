#!/bin/bash
# Daily Hukamnama Auto-Sync & Poster Generation
export TZ="Asia/Kolkata"
LOG="/var/log/hukamnama_cron.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Starting Daily Hukamnama auto-sync..." >> "$LOG"
RESULT=$(curl -s -m 120 -X POST http://localhost:3015/api/hukamnama)
echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Result: $RESULT" >> "$LOG"
