/**
 * 測試 IMDb API 功能
 *
 * 用於驗證 OMDb API 是否正常運作，並查看回傳的電影資訊格式
 * 測試 ID："tt1674782" 對應電影《雷神索爾》(Thor, 2011)
 */
function testImdbApi() {
      Logger.log(fetchIMDbInfo("tt1674782"));
}
