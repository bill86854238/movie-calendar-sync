
/**
 * 記錄電影事件新增或修改的歷程到指定的 Google Sheet。
 * 
 * @param {string} action - 動作類型，例如 "新增"、"修改"、"刪除"。
 * @param {string} title - 電影名稱。
 * @param {Date} date - 上映日期（Date 物件）。
 * @param {string} [sheetId] - Google Sheet 的 ID，必填。若未提供則跳過並警告。
 */
function recordChange(action, title, date) {
  if (logSheetId == "你的GoogleSheet_ID") {
    Logger.log('錯誤：未提供 Google Sheet ID，無法記錄歷程。');
    return; // 沒有 sheetId 就跳過，不執行後續
  }

  try {
    const sheet = SpreadsheetApp.openById(logSheetId).getActiveSheet();
    // 新增一筆紀錄到 Sheet，欄位：時間、動作、電影名稱、上映日期
    sheet.appendRow([
      new Date(),   // 紀錄當下時間
      action,       // 新增、修改、刪除
      title,        // 電影名稱
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd')  // 格式化日期
    ]);
    Logger.log(`已記錄歷程：${action} - ${title} (${date.toDateString()})`);
  } catch (e) {
    Logger.log('記錄歷程失敗：' + e.message);
  }
}
