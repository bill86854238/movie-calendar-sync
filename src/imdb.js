/**
 * 從開眼電影詳細頁面中提取 IMDb ID
 *
 * 透過正則表達式搜尋頁面中的 IMDb 連結，擷取出 IMDb ID (格式：tt + 數字)
 *
 * @param {string} detailUrl - 開眼電影的詳細頁面網址
 * @returns {string|null} IMDb ID（例如："tt1234567"），若找不到則回傳 null
 */
function fetchIMDbIdFromDetailPage(detailUrl) {
  try {
    const html = UrlFetchApp.fetch(detailUrl).getContentText();
    // 正則表達式：匹配 <a href="https://www.imdb.com/title/tt1234567">IMDb</a> 格式的連結
    const match = html.match(/<a\s+href="https?:\/\/(?:www\.)?imdb\.com\/title\/(tt\d+)[^"]*"[^>]*>IMDb<\/a>/i);
    if (match) {
      const imdbId = match[1].trim();
      Logger.log("找到 IMDb ID: " + imdbId);
      return imdbId;
    }
  } catch (e) {
    Logger.log("讀取 IMDb ID 失敗: " + e.message);
  }
  return null;
}


/**
 * 從 OMDb API 取得 IMDb 電影詳細資訊
 *
 * 使用 IMDb ID 向 OMDb API 查詢電影的評分、導演、類型、劇情等詳細資訊
 *
 * @param {string} imdbId - IMDb ID（例如："tt1234567"）
 * @returns {Object|null} 包含電影資訊的物件，若查詢失敗則回傳 null
 * @returns {string} returns.imdbRating - IMDb 評分
 * @returns {string} returns.director - 導演
 * @returns {string} returns.genre - 電影類型
 * @returns {string} returns.country - 製作國家
 * @returns {string} returns.plot - 劇情簡介
 * @returns {string} returns.year - 上映年份
 */
function fetchIMDbInfo(imdbId) {
  const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDb_API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    if (data.Response === 'True') {
      return {
        imdbRating: data.imdbRating,
        director: data.Director,
        genre: data.Genre,
        country: data.Country,
        plot: data.Plot,
        year: data.Year
      };
    } else {
      Logger.log(`找不到電影資料: ${imdbId}`);
      return null;
    }
  } catch (error) {
    Logger.log(`IMDb API 錯誤 (${imdbId}): ${error}`);
    return null;
  }
}
