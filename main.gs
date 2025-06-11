function addMoviesFromAllToCalendar() {
  const url = "https://www.atmovies.com.tw/movie/next/0/";
  const html = UrlFetchApp.fetch(url).getContentText();

  const calendarId = "";
  const calendar = CalendarApp.getCalendarById(calendarId);

  const sectionPattern = /<h2 class="major">\s*<span>(\d{4}\/\d{2}\/\d{2})<\/span>\s*<\/h2>\s*<ul class="filmListAll">([\s\S]*?)<\/ul>/g;

  let match;
  while ((match = sectionPattern.exec(html)) !== null) {
    const dateStr = match[1];
    const ulContent = match[2];

    const parts = dateStr.split('/');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    const liPattern = /<li>([\s\S]*?)<\/li>/g;
    let liMatch;

    while ((liMatch = liPattern.exec(ulContent)) !== null) {
      const liBlock = liMatch[1];
      const titleMatch = /<div class="filmtitle">\s*<a[^>]*>(.*?)<\/a>/i.exec(liBlock);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const eventTitle = `${title} 上映`;

        // 🔍 找所有叫這個名字的事件（跨整年）
        const allEvents = calendar.getEvents(new Date('2025-01-01'), new Date('2026-01-01'), { search: eventTitle });
        let foundCorrectDate = false;

        for (const e of allEvents) {
          const eventDate = e.getStartTime();
          const isSameDay =
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate();

          if (e.getTitle() === eventTitle) {
            if (isSameDay) {
              foundCorrectDate = true; // ✅ 已存在正確事件
            } else {
              // 🗑️ 刪除錯誤日期的事件
              Logger.log(`❌ 刪除錯誤日期事件: ${eventTitle} (原日期: ${eventDate.toDateString()})`);
              recordChange('刪除', title, eventDate);
              e.deleteEvent();
            }
          }
        }

        if (!foundCorrectDate) {
          calendar.createAllDayEvent(eventTitle, date);
          Logger.log(`✅ 新增電影: ${title}，上映日: ${date.toDateString()}`);
          recordChange('新增', title, date);   // 呼叫獨立函式
        } else {
          Logger.log(`🔁 已存在正確事件: ${title}，上映日: ${date.toDateString()}`);
        }
      }
    }
  }
}
