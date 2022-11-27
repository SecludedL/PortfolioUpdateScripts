import { Instrument } from '../../Models/instrument';
import { updaterAbstract } from './updaterAbstract'

export class updaterIndexesRo extends updaterAbstract {
  protected tickerFormat = /IX\.RO\-([a-z0-9-]{1,6})/i;

  public getLatestDetails(ticker: string): Instrument {
    // retrieve the latest index value
    var latestIndexValue = this.getLatestIndexValue(
      this.getBvbIndexCodeByTicker(ticker)
    );
    
    if (latestIndexValue.value == null) {
      throw new Error("Can't retrieve latest value for index " + ticker);
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestIndexValue.value, latestIndexValue.valueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  // turn the ticker into an index code/symbol (used by BVB) by stripping the prefix eg: IX.RO-BET turns into BET
  private getBvbIndexCodeByTicker(ticker: string) {
    let matches = ticker.match(this.tickerFormat);
    return matches[1];
  }
  
  private getLatestIndexValue(indexTicker: string) {
    // fetch the content of the index page on the bvb.ro website
    let url      = "http://bvb.ro/FinancialInstruments/Indices/IndicesProfiles.aspx?i=" + indexTicker;  
    let response = UrlFetchApp.fetch(url).getContentText();
  
    // try to get to the node that hosts the index value and remove the thousands separator
    const doc      = Cheerio.load(response);
    let valueLabel = doc('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 b.value').text();
    let indexValue = Number(valueLabel.replace(',', ''));
    
    // attempt to get the date associated with the index value
    let valueDateLabel   = doc('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 span.date').text();
    let valueDateMatches = valueDateLabel.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,4})/i);
    let indexValueDate: Date;
    
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