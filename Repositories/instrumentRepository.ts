import { Instrument } from '../Models/instrument'

export class instrumentRepository {
  private tickerDictionary: Map<string, Instrument>;
  private referenceSheet: string;

  public constructor(referenceSheetName = 'Referinte') {
    this.tickerDictionary = new Map();
    this.referenceSheet = referenceSheetName;
  }

  public getAllInstruments() {
    if (this.tickerDictionary.size > 0) {
      return this.tickerDictionary;
    }
        
    // if the data was not looked up, scan the entire sheet for tickers and cache their values
    this.tickerDictionary = this.getInstrumentsFromReferenceSheet();
    
    return this.tickerDictionary;
  }

  public getInstrumentDataByTicker(lookupTicker: string) {
    var instruments = this.getAllInstruments();
    
    // if the data for this ticker was already looked up, return it
    if (instruments.has(lookupTicker)) {
      return instruments.get(lookupTicker);
    } else {
      return null;
    }
  }
  
  public persistInstrument(instrument: Instrument) {
    var rowIndex = this.lookupInstrumentRowInReferenceSheet(instrument.getTicker());

    if (!rowIndex) {
      return false;
    }
    
    var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.referenceSheet);
    var range    = refSheet.getRange("C" + rowIndex + ":E" + rowIndex);
    range.setValues([
      [instrument.getValue(), instrument.getValueDate(), instrument.getLastUpdateDate()]
    ]);
    
    return true;
  }

  private getInstrumentsFromReferenceSheet(): Map<string, Instrument> {
    var refSheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.referenceSheet)
    var sheetData = refSheet.getDataRange().getValues();
        
    // stores information about all instruments retrieved from the sheet
    var instruments = new Map();
    
    // cycle through all ticker candidates and store their values
    for (var _i = 0; _i < sheetData.length; _i++) {
      var rowData = sheetData[_i];
      
      try {
        // the ticker is part of the first column
        var currentInstrument = new Instrument(rowData[0]);
      } catch (ex) {
        // failing to instantiate the instrument means that the row is not a valid ticker
        continue;
      }
      
      // value(price) is in the third column, while value date is in the fourth column
      currentInstrument.setValue(rowData[2], rowData[3]);
      // last update date as fifth column
      currentInstrument.setLastUpdateDate(rowData[4]);

      instruments.set(currentInstrument.getTicker(), currentInstrument);
    }
    
    return instruments;
  }

  private lookupInstrumentRowInReferenceSheet(ticker: string) {
    var refSheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.referenceSheet)
    var sheetData = refSheet.getDataRange().getValues();
        
    // cycle through all ticker candidates and return when a match is found
    for (var _i = 0; _i < sheetData.length; _i++) { 
      var rowData = sheetData[_i];
      
      if (rowData[0] == ticker) { 
          return _i + 1;//row numbering starts from 1
      }
    }
    
    return null;
  }
}
