function updaterInternationalStocks() {
  var tickerFormat = /(SG|GB|ES|PT).([a-z0-9-]{1,6})/i;
  var apiKey       = "8b0dbbae7f529fc1ccadd36b36eb6569";
  
  var countryMapper = {SG: "XSES", GB: "XLON", ES: "BMEX", PT: "XLIS"};
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
  
  this.getLatestValue = function(ticker) {
    // turn the ticker into an asset code by converting the country code and using it as a suffix instead of prefix. eg: SG.CEE turns into CEE.SGP
    var matches = ticker.match(tickerFormat);
    
    var countryCode = matches[1];
    if (countryMapper[countryCode] == undefined) {
      return null;
    }
    countryCode = countryMapper[countryCode];
    
    let latestAssetPrice = getLatestAssetValue(matches[2] + '.' + countryCode);
    
    if (latestAssetPrice == null) {
      return null;
    } else if (latestAssetPrice.value == null) {
      return null;
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestAssetPrice.value, latestAssetPrice.valueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  var getLatestAssetValue = function(assetTicker) {
    // fetch the content of the asset page on the bvb.ro website
    var url = "http://api.marketstack.com/v1/eod/latest?symbols=" + assetTicker + "&access_key=" + apiKey;
    
    try {
      var response = UrlFetchApp.fetch(url).getContentText();
  
      // try to get the rate from the response
      var jsonResult = JSON.parse(response);
      
      return {
        value: getAssetValueFromResponse(jsonResult),
        valueDate: getAssetValueDateFromResponse(jsonResult)
      }
    } catch (error) {
      throw new Error(error.message);
      return null;
    }
  }
  
  var getAssetValueFromResponse = function(responseObj) {
    if (responseObj.data[0].close == null) {
      return null;
    }
    
    return Number(responseObj.data[0].close);
  }
  
  var getAssetValueDateFromResponse = function(responseObj) { 
    if (responseObj.data[0].date == null) {
      return null;
    }
    
    return new Date(responseObj.data[0].date);
  }
}