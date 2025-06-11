function fetchIMDbIdFromDetailPage(detailUrl) {
  try {
    const html = UrlFetchApp.fetch(detailUrl).getContentText();
    const match = html.match(/<a\s+href="https?:\/\/(?:www\.)?imdb\.com\/Title\?([^"]+)"[^>]*>IMDb<\/a>/i);
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
