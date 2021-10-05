import { Instrument } from "../../Models/instrument";
import { updaterAbstract } from "./updaterAbstract";

export class updaterStocksRo extends updaterAbstract {
  protected tickerFormat = /RO\.([a-z0-9-]{1,6})/i;
  
  public getLatestDetails(ticker: string): Instrument {
    // turn the ticker into an asset code by stripping the prefix. eg: RO.TLV turns into TLV
    var matches          = ticker.match(this.tickerFormat);
    var updatedPriceData = this.getLatestAssetValue(matches[1]);
    
    if (updatedPriceData.valueDate == null) {
      return null;
    }
    
    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(updatedPriceData.value, updatedPriceData.valueDate);
    updatedInstrument.setLastUpdateDate(new Date());
    
    return updatedInstrument;
  }
  
  private getLatestAssetValue(assetTicker) {
    // fetch the content of the asset page on the bvb.ro website
    var url      = "http://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=" + assetTicker;
    var response = UrlFetchApp.fetch(url);

    if ((response.getResponseCode() !== 200)
        || (response.getContentText().match(/invalid/i))) {
      throw new Error("Can't retrieve BVB pricing page for instrument " + assetTicker);
    }

    // Use a custom library (Cheerio) in order to parse the HTML contents of the page, as XmlSerivce is too strict
    const doc = Cheerio.load(response.getContentText());
       
    return {
      value: this.getLatestPriceFromDocument(doc),
      valueDate: this.getLatestPriceDateFromDocument(doc)
    };
  }
  
  private getLatestPriceFromDocument(doc):number {
    // extract the latest price and process it in order to be treated as a number
    let latestPrice = doc('.tooltip-value .value').text();
    
    // remove the thousands separator (comma)
    if (latestPrice == undefined) {
      return null;
    } else {
      return Number(latestPrice.replace(',', '')).valueOf();
    }
  }
  
  private getLatestPriceDateFromDocument(doc):Date {
    // extract the corresponding date for the latest price
    let priceDateNode = doc('.horizontal-box .tooltip-value .date').text();
    let priceDateMatches = priceDateNode.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,4})/i);
    
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