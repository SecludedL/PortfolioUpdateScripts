import { Document } from "parse5/dist/tree-adapters/default";
import { Instrument } from "../../Models/Instrument";
import { updaterAbstract } from "./updaterAbstract";
import { JSDOM } from "jsdom";

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

    // const document =  Cheerio.load(response.getContentText());
    // return the JSDOM object from the HTTP response object
    const document = new JSDOM(response.getContentText()).window.document;
       
    return {
      value: this.getLatestPriceFromDocument(document),
      valueDate: this.getLatestPriceDateFromDocument(document)
    };
  }
  
  private getLatestPriceFromDocument(doc: JSDOM):number {
    // extract the latest price using JSDOM and process it in order to be treated as a number
    const latestPrice = doc.querySelector('.tooltip-value .value').textContent;
    
    // remove the thousands separator (comma)
    if (latestPrice == undefined) {
      return null;
    } else {
      return Number(latestPrice.replace('.', '').replace(',', '.')).valueOf();
    }
  }
  
  private getLatestPriceDateFromDocument(doc: JSDOM):Date {
    // extract the  date for the latest price 
    const priceDateNode = doc.querySelector('.tooltip-value .date').textContent;

    // extract the date from the string and convert it to a Date object
    const priceDateMatches = priceDateNode.match(/(\d{1,2})\.(\d{1,2})\.(\d{1,4})/i);
    
    if (priceDateMatches == null) {
      return null;
    }
    
    if (priceDateMatches.length < 4) {
      return null;
    }
    
    let priceDateString = `${priceDateMatches[3]}-${priceDateMatches[2]}-${priceDateMatches[1]}`
    return new Date(priceDateString);
  }
}