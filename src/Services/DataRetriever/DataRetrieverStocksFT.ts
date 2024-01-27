import { Instrument } from '../../Models/Instrument';
import { DataRetrieverAbstract } from './DataRetrieverAbstract';
import Cheerio, { CheerioAPI } from 'cheerio';

export class DataRetrieverStocksFT extends DataRetrieverAbstract {
  // ticker format matched by this data retriever: IX.RO-<index_code>
  protected tickerFormat = /(PT|MX)\.([a-z0-9-]{1,8})/i;

  private exchangeMapper = {PT: "LIS", MX: "MEX"};

  public getLatestDetails(ticker: string): Instrument {
    // retrieve the normalized ticker for this instrument
    // the normalized ticker is basically the stock code/symbol used by underlying data provider
    const normalizedTicker = this.getFTCompanyCodeByTicker(ticker);

    if (normalizedTicker == null) {
      throw new Error("Can't map the ticker for " + ticker);
    }

    // retrieve the contents of the page containing index details from the bvb.ro website
    const indexPageObject:CheerioAPI = this.fetchEquitiesPageContents(normalizedTicker);

    // attempt to retrieve the index value and the corresponding date from the page contents
    const latestInstrumentValue     = this.getInstrumentValueFromPage(indexPageObject);
    const latestInstrumentValueDate = this.getInstrumentValueDateFromPage(indexPageObject);
    
    if (latestInstrumentValue == null) {
      throw new Error("Can't retrieve latest value for index " + ticker);
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestInstrumentValue, latestInstrumentValueDate);
    updatedInstrument.setLastUpdateDate(new Date())
    
    return updatedInstrument;
  }
  
  // turn the ticker into an index code/symbol used by FT
  private getFTCompanyCodeByTicker(ticker: string) {
    let matches = ticker.match(this.tickerFormat);

    if (matches.length < 2) {
      return null;
    }

    // attempts to find the FT exchange code for the given ticker
    if (this.exchangeMapper[matches[1]] == undefined) {
      return null;
    }

    const exchangeCode = this.exchangeMapper[matches[1]];
    const companyCode  = matches[2];

    return companyCode + ":" + exchangeCode;
  }

  /**
   * Retrieves the contents of the page containing an equity instrument's details from the ft.com website
   * and returns the contents as a CheerioAPI object
   * 
   * @param equityTicker 
   * @returns CheerioAPI
   */
  private fetchEquitiesPageContents(equityTicker: string): CheerioAPI {
    const url     = "https://markets.ft.com/data/equities/tearsheet/summary?s=" + equityTicker;  
    const headers = {
      'User-Agent': 'PostmanRuntime/7.36.1',
      'Accept': '*/*'
    };
    let response = this.HTTPClient.getPageContents(url, headers);
    
    return Cheerio.load(response.getResponseBody());
  }

  /**
   * Attempts to retrieve the equity instrument's value from the raw page contents
   * 
   * @param instrumentPageObject 
   * @returns number
   */
  private getInstrumentValueFromPage(instrumentPageObject: CheerioAPI): number {
    let valueLabel = instrumentPageObject('.mod-tearsheet-overview__quote li:first-child span.mod-ui-data-list__value').text();
    // remove the thousands separator and convert the value to a number
    let indexValue = Number(valueLabel.replace(',', ''));
    
    return indexValue;
  }


  /**
   * Attempts to retrieve the date corresponding to the latest equity instrument value from the raw page contents
   * 
   * @param instrumentPageObject 
   * @returns Date
   */
  private getInstrumentValueDateFromPage(instrumentPageObject: CheerioAPI): Date {
    // attempt to get the date associated with the index value
    let valueDateLabel   = instrumentPageObject('.mod-tearsheet-overview__quote div.mod-disclaimer').text();
    let valueDateMatches = valueDateLabel.match(/([a-zA-Z]{3})\s+(\d{1,2})\s+(\d{2,4})/i);
    let indexValueDate: Date;
    
    if (valueDateMatches.length < 4) {
      return null;
    }

    indexValueDate = new Date(valueDateMatches[0]);

    return indexValueDate;
  }
}
