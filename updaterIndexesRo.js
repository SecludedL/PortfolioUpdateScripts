function updaterIndexesRo() {
  var tickerFormat = /IX\.RO\-([a-z0-9-]{1,6})/i;
  
  this.matchTicker = function(ticker) {
    if (ticker.match(tickerFormat)) {
      return true;
    }
    
    return false;
  }
   
  this.getLatestValue = function(ticker) {
    // retrieve the latest 
    var latestIndexValue = getLatestIndexValue(getBvbIndexCodeByTicker(ticker));
    
    if (latestIndexValue.value == null) {
      return null;
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestIndexValue.value, latestIndexValue.valueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  // turn the ticker into an index code/symbol (used by BVB) by stripping the prefix eg: IX.RO-BET turns into BET
  var getBvbIndexCodeByTicker = function(ticker) {
    let matches = ticker.match(tickerFormat);
    return matches[1];
  }
  
  var getLatestIndexValue = function(indexTicker) {
    // fetch the content of the index page on the bvb.ro website
    let url      = "http://bvb.ro/FinancialInstruments/Indices/IndicesProfiles.aspx?i=" + indexTicker;  
    let response = UrlFetchApp.fetch(url).getContentText();
  
    // try to get to the node that hosts the index value and remove the thousands separator
    const doc      = Cheerio.load(response);
    let valueLabel = doc('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 strong.value').text();
    let indexValue = Number(valueLabel.replace(',', ''));
    
    // attempt to get the date associated with the index value
    let valueDateLabel   = doc('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 span.date span.small').text();
    let valueDateMatches = valueDateLabel.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,4})/i);
    let indexValueDate;
    
    if (valueDateMatches.length == 4) {
      let valueDateString = `${valueDateMatches[3]}-${valueDateMatches[1]}-${valueDateMatches[2]}`
      indexValueDate = new Date(valueDateString);
    } else {
      indexValueDate = null;
    }

    // finally, build the return object made of the index value and the associated date
    return {
      value: indexValue,
      valueDate: indexValueDate
    };
  }

}