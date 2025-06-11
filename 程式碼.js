function listCalendars() {
  const calendars = CalendarApp.getAllCalendars();
  calendars.forEach(cal => Logger.log(`名稱：${cal.getName()}，ID：${cal.getId()}`));
}



