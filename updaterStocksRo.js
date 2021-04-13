function updaterStocksRo() {
  var tickerFormat = /RO\.([a-z0-9-]{1,6})/i;
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
  
  this.getLatestValue = function(ticker) {
    // turn the ticker into an asset code by stripping the prefix. eg: RO.TLV turns into TLV
    var matches          = ticker.match(tickerFormat);
    var updatedPriceData = getLatestAssetValue(matches[1]);
    
    if (updatedPriceData.value == null) {
      return null;
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(updatedPriceData.value, updatedPriceData.valueDate);
    updatedInstrument.setLastUpdateDate(new Date());
    
    return updatedInstrument;
  }
  
  var getLatestAssetValue = function(assetTicker) {
    // fetch the content of the asset page on the bvb.ro website
    var url      = "http://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=" + assetTicker;  
    var response = UrlFetchApp.fetch(url).getContentText();  
    // Use a custom library (Cheerio) in order to parse the HTML contents of the page, as XmlSerivce is too strict
    const doc    = Cheerio.load(response);
       
    return {
      value: getLatestPriceFromDocument(doc),
      valueDate: getLatestPriceDateFromDocument(doc)
    };
  }
  
  var getLatestPriceFromDocument = function(doc) {
    // extract the latest price and process it in order to be treated as a number
    let latestPrice = doc('.horizontal-box .value').text();
    
    // remove the thousands separator (comma)
    if (latestPrice == undefined) {
      return null;
    } else {
      return Number(latestPrice.replace(',', ''));
    }
  }
  
  var getLatestPriceDateFromDocument = function(doc) {
    // extract the corresponding date for the latest price
    let priceDateNode = doc('.horizontal-box .tooltip-value .date').text();
    let priceDateMatches = priceDateNode.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,4})/i);
    let latestPriceDate;
    
    if (priceDateMatches == null) {
      return null;
    }
    
    if (priceDateMatches.length < 4) {
      return null;
    }
    
    let priceDateString = `${priceDateMatches[3]}-${priceDateMatches[1]}-${priceDateMatches[2]}`
    return new Date(priceDateString);
  }
}