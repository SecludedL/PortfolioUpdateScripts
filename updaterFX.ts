function updaterFX() {
  var tickerFormat = /FX\.([a-z]{2,3})\/([a-z]{2,3})/i;
  var accessKey    = '8400f1465e9c55f70581396fa9fc37c8';
  var baseCurrency = 'USD';
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
  
  this.getLatestValue = function(ticker) {
    // turn the ticker into a Forex pair: eg: FX.EUR/SGD turns into (EUR)/(SGD) pair
    var matches      = ticker.match(tickerFormat);
    var updatedQuote = getLatestFxQuote(matches[1], matches[2]);
    
    // build an Instrument object and return it
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(updatedQuote.value, updatedQuote.valueDate);
    updatedInstrument.setLastUpdateDate(new Date());
    
    return updatedInstrument;
  }

  
  var getLatestFxQuote = function(baseCurrency, pairCurrency) {    
    // fetch the content of the index page on the bvb.ro website
    let url      = "https://api.exchangeratesapi.io/latest?access_key=" + accessKey + '&source=' + baseCurrency + "&currencies=" + pairCurrency;  
    let response = UrlFetchApp.fetch(url).getContentText();
    response     = JSON.parse(response);
  
    // try to get the rate from the response
    let fxRate;
    
    if (response.rates[pairCurrency] == undefined) {
      fxRate = null;
    } else {
      fxRate = Number(response.rates[pairCurrency])
    }
    
    // try to get the corresponding date for the retrieved rate
    let fxRateDate;
    
    if (response.date == undefined) {
      fxRateDate = null;
    } else {
      fxRateDate = new Date(response.date)
    }
    
    return {
      value: fxRate,
      valueDate: fxRateDate
    }
  }  
}