# 🎬 movie-calendar-sync

這個專案是一個 Google Apps Script 腳本，用來從《開眼電影網》自動擷取即將上映電影的資料，並建立對應的 Google 日曆事件。

---

## 📌 功能特色

- 自動抓取《開眼電影網》的上映排程
- 每部電影建立「電影名稱 上映」的全日行事曆事件
- 若電影上映日期變動，自動刪除錯誤日期並新增正確日期
- 可記錄新增歷程至 Google Sheet（需設定 `sheetId`）
- 每日排程執行一次，確保行事曆最新

---

## 🚀 使用方式

1. 將 `addMoviesFromAllToCalendar()` 等函式貼入 Google Apps Script 編輯器
2. 替換你的 Google Calendar ID
3. （可選）設定 Google Sheet ID 記錄歷程
4. 建立每日時間驅動器（trigger）定期執行

---

## 🔄 Google Apps Script × GitHub 專案同步說明

本專案採用 Google Apps Script（GAS）結合 [`clasp`](https://github.com/google/clasp) 工具，並以 GitHub 進行版本控制，方便多人協作與雲端同步。

### 🧱 一、專案初始化流程

```bash
git clone https://github.com/你的帳號/專案名稱.git
cd 專案名稱
mkdir src

```

---

### ⚙️ 二、clasp 設定與 GAS 專案同步

1. 安裝與登入 clasp：
```bash
npm install -g @google/clasp
clasp login
```

2. 建立並設定 `.clasp.json`：
```bash
cp .clasp.json.example .clasp.json
```

填入你的 Script ID（從 GAS 編輯器取得）：
```json
{
  "scriptId": "你的 Script ID",
  "rootDir": "./src"
}
```

3. 同步 GAS 程式碼：
```bash
clasp pull   # 從雲端拉回現有程式碼
```

---

### 🛠️ 三、日常開發常用指令

| 指令           | 用途                          |
|----------------|-------------------------------|
| `clasp push`   | 推送本地修改到 GAS            |
| `clasp pull`   | 從 GAS 拉取最新程式碼         |
| `clasp open`   | 開啟線上 GAS 編輯器           |

---

### 📁 四、目錄結構範例

```
movie-calendar-sync/
├─ src/              # 所有 GAS 程式碼
├─ .clasp.json       # 本地設定（請勿上傳 Git）
├─ .gitignore        # Git 忽略規則
└─ README.md         # 專案說明文件
```

---

### ⚠️ 五、注意事項

- `.clasp.json` 僅供本地設定，請勿提交到 GitHub
- 若遇同步衝突，可使用 `clasp pull --force` 強制覆蓋
- `scriptId` 可於 GAS 編輯器 → 專案設定頁面複製
- 建議所有程式碼放在 `src/` 目錄下，利於同步與版本控制
- 進階自動化或協作需求，請參考 [Clasp 官方文件](https://github.com/google/clasp)

