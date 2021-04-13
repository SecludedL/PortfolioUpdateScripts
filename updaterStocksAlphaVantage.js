function updaterStocksAlphaVantage() {
  var tickerFormat = /(GB|ES)\.([a-z0-9-]{1,6})/i;
  var apiKey       = "04ZPFZFMHTNHGQLG";
  
  var countryMapper = {GB: "LON", ES: "MDR"};
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
  
  this.getLatestValue = function(ticker) {
    // turn the ticker into an asset code by converting the country code and using it as a suffix instead of prefix. eg: SG.CEE turns into CEE.SGP
    let alphaVantageSymbol = getAlphaVantageSymbolByTicker(ticker);
    let latestStockPrice   = getLatestAssetValue(alphaVantageSymbol);
    
    console.log(ticker, latestStockPrice);
    
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
  
  var getAlphaVantageSymbolByTicker = function(ticker) {
    var matches = ticker.match(tickerFormat);
    
    var countryCode = matches[1];
    if (countryMapper[countryCode] == undefined) {
      return null;
    }
    countryCode = countryMapper[countryCode];
    
    return matches[2] + '.' + countryCode;
  }
  
  var getLatestAssetValue = function(assetTicker) {
    // fetch the latest asset prices from the AlphaVantage API
    var url      = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + assetTicker + "&apikey=" + apiKey;
    let response = UrlFetchApp.fetch(url).getContentText();
    response = JSON.parse(response);
  
    if (response["Error Message"]) {
      return null;
    }
    
    // try to get the latest price from the response
    let assetValue;
    
    if (response["Global Quote"]["05. price"] == undefined) {
      assetValue = null;
    } else {
      assetValue = Number(response["Global Quote"]["05. price"]);
    }
    
    // try to get the corresponding date for the latest price
    let assetValueDate;
    
    if (response["Global Quote"]["07. latest trading day"] == undefined) {
      assetValueDate = null;
    } else {
      assetValueDate = Date(response["Global Quote"]["07. latest trading day"]);
    }
    
    return {
      value: assetValue,
      valueDate: assetValueDate
    }
  }
}