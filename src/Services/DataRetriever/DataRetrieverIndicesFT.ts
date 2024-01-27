import { Instrument } from '../../Models/Instrument';
import { DataRetrieverAbstract } from './DataRetrieverAbstract';
import Cheerio, { CheerioAPI } from 'cheerio';

export class DataRetrieverIndicesFT extends DataRetrieverAbstract {
  // ticker format matched by this data retriever: IX.RO-<index_code>
  protected tickerFormat = /IX\.MSCI\-([a-z0-9-]{1,6})/i;

  private tickerMapping = {"World": "MS-WX:MSI"};

  public getLatestDetails(ticker: string): Instrument {
    // retrieve the normalized ticker for this instrument
    // the normalized ticker is basically the index code/symbol used by underlying data provider
    const normalizedTicker = this.getFTIndexCodeByTicker(ticker);

    if (normalizedTicker == null) {
      throw new Error("Can't map the ticker for " + ticker);
    }

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
  
  // turn the ticker into an index code/symbol used by FT
  private getFTIndexCodeByTicker(ticker: string) {
    let matches = ticker.match(this.tickerFormat);

    if (matches.length < 2) {
      return null;
    }

    // attempts to find the FT instrument code/symbol for the given ticker
    if (this.tickerMapping[matches[1]] == undefined) {
      return null;
    }

    return this.tickerMapping[matches[1]];
  }

  /**
   * Retrieves the contents of the page containing index details from the ft.com website
   * and returns the contents as a CheerioAPI object
   * 
   * @param indexTicker 
   * @returns CheerioAPI
   */
  private fetchIndexPageContents(indexTicker: string): CheerioAPI {
    const url     = "https://markets.ft.com/data/indices/tearsheet/summary?s=" + indexTicker;  
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
    let valueLabel = indexPageObject('.mod-tearsheet-overview__quote li:first-child span.mod-ui-data-list__value').text();
    // remove the thousands separator and convert the value to a number
    let indexValue = Number(valueLabel.replace(',', ''));
    
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
    let valueDateLabel   = indexPageObject('.mod-tearsheet-overview__quote div.mod-disclaimer').text();
    let valueDateMatches = valueDateLabel.match(/([a-zA-Z]{3})\s+(\d{1,2})\s+(\d{2,4})/i);
    let indexValueDate: Date;
    
    if (valueDateMatches.length < 4) {
      return null;
    }

    indexValueDate = new Date(valueDateMatches[0]);

    return indexValueDate;
  }
}
