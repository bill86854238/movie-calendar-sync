# movie-calendar-sync

這個專案是一個 Google Apps Script 腳本，用來從《開眼電影網》自動擷取即將上映電影的資料，並建立對應的 Google 日曆事件。

## 功能特色

- 自動抓取《開眼電影網》的上映排程
- 每部電影建立「電影名稱 上映」的全日行事曆事件
- 若電影上映日期變動，自動刪除錯誤日期並新增正確日期
- 每日排程執行一次，確保行事曆最新

## 使用方式

1. 將 `addMoviesFromAllToCalendar()` 貼入 Google Apps Script
2. 替換你的 Google Calendar ID
3. 設定每日時間驅動器（trigger）定期執行

