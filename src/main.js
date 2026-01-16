/**
 * 從開眼電影網站抓取即將上映的電影資訊，並同步到 Google 日曆
 *
 * 主要功能：
 * 1. 爬取開眼電影「本週新片」頁面
 * 2. 解析每部電影的上映日期、片名、IMDb ID
 * 3. 檢查日曆中是否已存在相同事件
 * 4. 刪除日期錯誤的舊事件，新增或保留正確的事件
 * 5. 將變更歷程記錄到 Google Sheet（若有設定）
 *
 * 執行流程：
 * - 使用正則表達式解析 HTML，擷取日期區塊和電影列表
 * - 對每部電影查詢 IMDb ID，並組合事件描述
 * - 搜尋整年度內同名的日曆事件，確保日期正確性
 * - 自動清理錯誤事件，避免重複或過期資料
 */
function addMoviesFromAllToCalendar() {
  const url = "https://www.atmovies.com.tw/movie/next/0/";
  let html;
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      html = UrlFetchApp.fetch(url).getContentText();
      break;
    } catch (e) {
      Logger.log(`連線失敗 (嘗試 ${i + 1}/${maxRetries}): ${e.message}`);
      if (i === maxRetries - 1) throw e;
      Utilities.sleep(1000 * Math.pow(2, i)); // 1s, 2s, 4s...
    }
  }

  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log(`無法取得日曆，請檢查 calendarId 是否正確: '${calendarId}'`);
    throw new Error(`無法取得日曆 (ID: ${calendarId})`);
  }

  // 正則表達式：匹配日期區塊 <h2>2024/01/01</h2> 和對應的電影列表 <ul class="filmListAll">...</ul>
  const sectionPattern = /<h2 class="major">\s*<span>(\d{4}\/\d{2}\/\d{2})<\/span>\s*<\/h2>\s*<ul class="filmListAll">([\s\S]*?)<\/ul>/g;

  let match;
  // 逐一處理每個日期區塊
  while ((match = sectionPattern.exec(html)) !== null) {
    const dateStr = match[1];        // 例如："2024/01/15"
    const ulContent = match[2];      // 該日期的所有電影 HTML 內容

    // 將日期字串轉換為 Date 物件
    const parts = dateStr.split('/');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    // 正則表達式：匹配每部電影的 <li> 區塊
    const liPattern = /<li>([\s\S]*?)<\/li>/g;
    let liMatch;

    // 處理該日期下的每部電影
    while ((liMatch = liPattern.exec(ulContent)) !== null) {
      const liBlock = liMatch[1];
      // 正則表達式：匹配電影標題 <div class="filmtitle"><a>片名</a></div>
      const titleMatch = /<div class="filmtitle">\s*<a[^>]*>(.*?)<\/a>/i.exec(liBlock);
      if (titleMatch) {
        // 正則表達式：同時擷取電影標題和詳細頁連結
        const detaiMatch = /<div class="filmtitle">\s*<a\s+href="([^"]+)">([^<]+)<\/a>/i.exec(liBlock);
        let description = '';
        let imdbId = '';
        let detailUrl = '';

        if(detaiMatch){
          detailUrl = "https://www.atmovies.com.tw" + detaiMatch[1]; // 組合詳細頁完整網址
          imdbId = fetchIMDbIdFromDetailPage(detailUrl);              // 從詳細頁抓取 IMDb ID
          // 若有 IMDb ID，則組合 IMDb 連結作為事件描述
          description = imdbId
              ? `IMDb 網頁：https://www.imdb.com/title/${imdbId}`
              : '';
          Logger.log(`IMDb ID: ${imdbId}`);
          Logger.log(`description: ${description}`);
        }


        const title = titleMatch[1].trim();
        const eventTitle = `${title} 上映`;  // 日曆事件標題格式


        // === 檢查並清理日曆中的重複或錯誤事件 ===
        let foundCorrectDate = false;

        // 1. 先檢查當天是否已有相同事件 (最準確，不受 search 索引延遲影響)
        // 並且清理當天已存在的重複事件
        const dailyEvents = calendar.getEventsForDay(date);
        let sameDayEvents = [];

        for (const e of dailyEvents) {
          if (e.getTitle() === eventTitle) {
            sameDayEvents.push(e);
          }
        }

        if (sameDayEvents.length > 0) {
          foundCorrectDate = true;
          // 如果當天有多個相同事件，保留第一個，刪除其餘的
          if (sameDayEvents.length > 1) {
             Logger.log(`發現當日重複事件：${title} (${dateStr}) - 共 ${sameDayEvents.length} 筆，正在清理...`);
             for (let i = 1; i < sameDayEvents.length; i++) {
               recordChange('刪除重複', title, date);
               sameDayEvents[i].deleteEvent();
            }
          }
        }

        // 2. 搜尋整年度內所有同名的事件（避免遺漏跨年度的重複事件，並清理舊日期的事件）
        const currentYear = new Date().getFullYear();
        const allEvents = calendar.getEvents(new Date(currentYear, 0, 1), new Date(currentYear + 1, 11, 31), { search: eventTitle });

        for (const e of allEvents) {
          const eventDate = e.getStartTime();
          // 比較事件日期是否與爬取到的上映日期完全相同（年、月、日）
          const isSameDay =
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate();

          if (e.getTitle() === eventTitle) {
            if (isSameDay) {
              foundCorrectDate = true; // ✅ 已存在正確日期的事件，無需重複新增
            } else {
              // ⚠️ 發現日期錯誤的舊事件（可能是上映日期變更），自動刪除
              recordChange('刪除', title, eventDate);
              e.deleteEvent();
            }
          }
        }

        // === 新增或保留事件 ===
        if (!foundCorrectDate) {
          // 日曆中不存在正確日期的事件，新增全天事件
          calendar.createAllDayEvent(`${title} 上映`, date, {
            description: description + "\n" +
            "開眼電影："+ detailUrl
          });
          recordChange('新增', title, date ,description);   // 記錄到 Google Sheet
        }
        // 若 foundCorrectDate = true，代表日曆中已有正確事件，不做任何操作
      }
    }
  }
}
