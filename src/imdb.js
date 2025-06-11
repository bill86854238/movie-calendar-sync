function fetchIMDbInfo(title) {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDb_API_KEY}`;

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
      Logger.log(`找不到電影資料: ${title}`);
      return null;
    }
  } catch (error) {
    Logger.log(`IMDb API 錯誤 (${title}): ${error}`);
    return null;
  }
}
