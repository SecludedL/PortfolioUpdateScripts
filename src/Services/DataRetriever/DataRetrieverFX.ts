import { Instrument } from "../../Models/Instrument";
import { DataRetrieverAbstract } from "./DataRetrieverAbstract";

/**
 * Provides methods to extract FX information using the apilayer.net API
 */
export class DataRetrieverFX extends DataRetrieverAbstract {
  protected tickerFormat = /FX\.([a-z]{2,3})\/([a-z]{2,3})/i;

  private accessKey = "562459454e40bb3b942ef135d8e4c9ac";
  private fixedBaseCurrency = "USD";

  public getLatestDetails(ticker: string): Instrument {
    // turn the ticker into a Forex pair: eg: FX.EUR/SGD turns into (EUR)/(SGD) pair
    const matches      = ticker.match(this.tickerFormat);
    const baseCurrency = matches[1];
    const pairCurrency = matches[2];
    const updatedQuote = this.getLatestFxQuote(baseCurrency, pairCurrency);

    // build an Instrument object and return it
    const updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(updatedQuote.value, updatedQuote.valueDate);
    updatedInstrument.setLastUpdateDate(new Date());

    return updatedInstrument;
  }

  /**
   * This method retrieves the latest FX quote for the pair of currencies provided
   * using the apilayer.net API and returns the value and the date of the quote.
   *
   * @param baseCurrency string
   * @param pairCurrency string
   * @returns { value: number, valueDate: Date}
   */
  private getLatestFxQuote(baseCurrency, pairCurrency: string) {    
    // the free pricing plan only allows for a fixed base currency, so if the base differs from 
    // the fixed one, first convert to the fixed base currency and then to the pair currency.
    let pairCurrencies = pairCurrency;

    if (this.fixedBaseCurrency !== baseCurrency) {
      pairCurrencies = pairCurrency + "," + baseCurrency;
    }

    // fetch the content of the index page on the bvb.ro website
    const url      = "http://apilayer.net/api/live?access_key=" + this.accessKey + '&source=' + this.fixedBaseCurrency + "&currencies=" + pairCurrencies;
    const response = this.HTTPClient.getPageContents(url, {});

    if (response.getResponseCode() != 200) {
      throw new Error('Error retrieving data for currency ' + pairCurrency + '. Message: ' + response.getResponseBody());
    }

    const responseObj = JSON.parse(response.getResponseBody());

    // try to get the rate from the response
    let fxRate = null;

    if (responseObj.quotes !== null) {
      if (baseCurrency !== this.fixedBaseCurrency) {
        const baseRate = responseObj.quotes[this.fixedBaseCurrency + baseCurrency];
        const pairRate = responseObj.quotes[this.fixedBaseCurrency + pairCurrency];

        fxRate = Number(pairRate) / Number(baseRate);
      } else {
        fxRate = Number(responseObj.quotes[baseCurrency + pairCurrency])
      }
    }

    // try to get the corresponding date for the retrieved rate
    let fxRateDate = null;

    if (responseObj.timestamp !== undefined) {
      fxRateDate = new Date(responseObj.timestamp * 1000)
    }

    return {
      value: fxRate,
      valueDate: fxRateDate,
    };
  }
}
