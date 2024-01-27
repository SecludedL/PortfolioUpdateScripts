import { Instrument } from '../../Models/Instrument';
import { DataRetrieverAbstract } from './DataRetrieverAbstract';
import Cheerio, { CheerioAPI } from 'cheerio';

export class DataRetrieverIndicesROBVB extends DataRetrieverAbstract {
  protected tickerFormat = /IX\.RO\-([a-z0-9-]{1,6})/i;

  public getLatestDetails(ticker: string): Instrument {
    // retrieve the latest index value
    const normalizedTicker = this.getBvbIndexCodeByTicker(ticker);

    // retrieve the contents of the page containing index details from the bvb.ro website
    const indexPageObject:CheerioAPI = this.fetchIndexPageContents(normalizedTicker);

    // attempt to retrieve the index value and the corresponding date from the page contents
    const latestIndexValue     = this.getIndexValueFromPage(indexPageObject);
    const latestIndexValueDate = this.getIndexValueDateFromPage(indexPageObject);
    
    if (latestIndexValue == null) {
      throw new Error("Can't retrieve latest value for index " + ticker);
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestIndexValue, latestIndexValueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  // turn the ticker into an index code/symbol (used by BVB) by stripping the prefix eg: IX.RO-BET turns into BET
  private getBvbIndexCodeByTicker(ticker: string) {
    let matches = ticker.match(this.tickerFormat);
    return matches[1];
  }

  /**
   * Retrieves the contents of the page containing index details from the bvb.ro website
   * and returns the contents as a CheerioAPI object
   * 
   * @param indexTicker 
   * @returns CheerioAPI
   */
  private fetchIndexPageContents(indexTicker: string): CheerioAPI {
    const url     = "https://bvb.ro/FinancialInstruments/Indices/IndicesProfiles.aspx?i=" + indexTicker;  
    const headers = {
      'User-Agent': 'PostmanRuntime/7.36.1',
      'Accept': '*/*'
    };
    let response = this.HTTPClient.getPageContents(url, headers);
    
    return Cheerio.load(response.getResponseBody());
  }

  /**
   * Attempts to retrieve the index value from the raw page contents
   * 
   * @param indexPageObject 
   * @returns number
   */
  private getIndexValueFromPage(indexPageObject: CheerioAPI): number {
    let valueLabel = indexPageObject('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 b.value').text();
    let indexValue = Number(valueLabel.replace('.', '').replace(',', '.'));
    
    return indexValue;
  }


  /**
   * Attempts to retrieve the date corresponding to the latest index value from the raw page contents
   * 
   * @param indexPageObject 
   * @returns Date
   */
  private getIndexValueDateFromPage(indexPageObject: CheerioAPI): Date {
    // attempt to get the date associated with the index value
    let valueDateLabel   = indexPageObject('#ctl00_ctl00_body_rightColumnPlaceHolder_IndexProfilesCurrentValues_UpdatePanel11 span.date').text();
    let valueDateMatches = valueDateLabel.match(/(\d{1,2})\.(\d{1,2})\.(\d{1,4})/i);
    let indexValueDate: Date;
    
    if (valueDateMatches.length == 4) {
      let valueDateString = `${valueDateMatches[3]}-${valueDateMatches[2]}-${valueDateMatches[1]}`
      indexValueDate = new Date(valueDateString);
    } else {
      indexValueDate = null;
    }

    return indexValueDate;
  }
}
