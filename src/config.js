/**
 * Google 日曆 ID
 * 用於指定要同步電影上映資訊的目標日曆
 * 可在 Google 日曆設定中找到日曆 ID（格式：xxx@group.calendar.google.com）
 */
const calendarId = "@group.calendar.google.com";

/**
 * Google Sheet ID（用於記錄變更歷程）
 * 如果不需要記錄歷程，可留空字串
 * 可從 Google Sheet 網址中取得 ID（https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit）
 */
const logSheetId = "";

/**
 * OMDb API 金鑰
 * 用於從 IMDb 取得電影詳細資訊（評分、導演、類型等）
 * 可至 https://www.omdbapi.com/apikey.aspx 免費申請
 */
const OMDb_API_KEY = '';
