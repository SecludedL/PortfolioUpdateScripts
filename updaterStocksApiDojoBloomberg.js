function updaterStocksApiDojoBloomberg() {
  var tickerFormat = /(AT|DKC|ES|GB|PT|SG)\.([a-z0-9-]{1,6})/i;
  var apiKey       = "af22c5daa4mshd4e741161eccb50p1288b5jsn28844ecf8513";
  
  var countryMapper = {AT: "av", DKC: "DC", ES: "sm", GB: "ln", PT: "li", SG: "sp"};
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
  
  this.getLatestValue = function(ticker) {
    // turn the ticker into an asset code by converting the country code and using it as a suffix instead of prefix. eg: SG.CEE turns into CEE.SGP
    let bloombergSymbol  = getBloombergSymbolForTicker(ticker);
    let latestStockPrice = getLatestAssetPrice(bloombergSymbol);
    
    if (latestStockPrice == null) {
      return null;
    } else if (latestStockPrice.value == null) {
      return null;
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestStockPrice.value, latestStockPrice.valueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  var getBloombergSymbolForTicker = function(ticker) {
    var matches = ticker.match(tickerFormat);
    
    var countryCode = matches[1];
    if (countryMapper[countryCode] == undefined) {
      return null;
    }
    countryCode = countryMapper[countryCode];
    assetCode   = matches[2] + ':' + countryCode
    
    // Bloomberg returns the response with uppercase asset code
    return assetCode.toUpperCase();
  }
  
  var getLatestAssetPrice = function(assetCode) {
    // fetch the latest asset prices from the AlphaVantage API
    let url        = "https://bloomberg-market-and-financial-news.p.rapidapi.com/market/get-compact?id=" + assetCode;
    let reqOptions = {
      'method': 'GET',
      'headers': {
        'x-rapidapi-host': 'bloomberg-market-and-financial-news.p.rapidapi.com',
        'x-rapidapi-key' : apiKey,
        'useQueryString' : true
      }
    }
    
    let response = UrlFetchApp.fetch(url, reqOptions).getContentText();
    response     = JSON.parse(response);
  
    if (response["result"][assetCode] == undefined) {
      return null;
    }

    return {
      value: getAssetValueFromResponse(assetCode, response),
      valueDate: getAssetValueDateFromResponse(assetCode, response)
    }
  }
  
  var getAssetValueFromResponse = function(assetCode, responseObj) {
    if (responseObj["result"][assetCode]["last"] == undefined) {
      return null;
    }
    
    return Number(responseObj["result"][assetCode]["last"]);
  }
  
  var getAssetValueDateFromResponse = function(assetCode, responseObj) { 
    if (responseObj["result"][assetCode]["lastPriceTime"] == undefined) {
      return null;
    }
    
    let timestampInMs = Number(responseObj["result"][assetCode]["lastPriceTime"]) * 1000;
    
    return new Date(timestampInMs);
  }
}