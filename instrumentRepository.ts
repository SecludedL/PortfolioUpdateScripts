import { Instrument } from './instrument'

function instrumentRepository() {
  this.tickerDictionary = null;
  var referencesSheet = "Referinte";
 
  this.getAllInstruments = function() {
    if (this.tickerDictionary !== null) {
      return this.tickerDictionary;
    }
        
    // if the data was not looked up, scan the entire sheet for tickers and cache their values
    this.tickerDictionary = getInstrumentDataFromSheet();
    
    return this.tickerDictionary;
  }
  
  this.getInstrumentDataByTicker = function(lookupTicker) {
    var instruments = this.getAllInstruments();
    
    // if the data for this ticker was already looked up, return it
    if (instruments[lookupTicker] != undefined) {
      return instruments[lookupTicker];
    } else {
      return null;
    }
  }
  
  this.persistInstrumentData = function(instrument) {
    var rowIndex = lookupInstrumentRowInSheet(instrument.getTicker());
    
    if (!rowIndex) {
      return false;
    }
    
    var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(referencesSheet);
    var range    = refSheet.getRange("C" + rowIndex + ":E" + rowIndex);
    range.setValues([
      [instrument.getValue(), instrument.getValueDate(), instrument.getLastUpdateDate()]
    ]);
    
    return true;
  }
  
  var getInstrumentDataFromSheet = function() {
    var refSheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(referencesSheet)
    var sheetData = refSheet.getDataRange().getValues();
        
    // stores information about all instruments retrieved from the sheet
    var instruments = {};
    
    // cycle through all ticker candidates and store their values
    for(i = 0; i < sheetData.length; i++) {
      var rowData = sheetData[i];
      
      try {
        // the ticker is part of the first column
        var currentInstrument = new Instrument(rowData[0]);
      } catch (Exception ex) {
        continue;
      }
      if (!Instrument.isValidTicker(rowData[0])) {
        continue;
      }
  
      
      // value(price) is in the third column, while value date is in the fourth column
      currentInstrument.setValue(rowData[2], rowData[3]);
      // last update date as fifth column
      currentInstrument.setLastUpdateDate(rowData[4]);
      
      instruments[rowData[0]] = currentInstrument;
    }
    
    return instruments;
  }
  
  var lookupInstrumentRowInSheet = function(ticker) {
    var refSheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(referencesSheet)
    var sheetData = refSheet.getDataRange().getValues();
        
    // cycle through all ticker candidates and return when a match is found
    for(i = 0; i < sheetData.length; i++) { 
      var rowData = sheetData[i];
      
      if (rowData[0] == ticker) { 
          return i + 1;//row numbering starts from 1
      }
    }
    
    return null;
  }
}
