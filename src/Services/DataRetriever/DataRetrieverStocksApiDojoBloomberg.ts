import { Instrument } from "../../Models/Instrument";
import { DataRetrieverAbstract } from "./DataRetrieverAbstract";

export class DataRetrieverStocksApiDojoBloomberg extends DataRetrieverAbstract {
  protected tickerFormat = /(AT|DE|DKC|ES|GB|SG|US)\.([a-z0-9-]{1,6})/i;

  private apiKey        = "af22c5daa4mshd4e741161eccb50p1288b5jsn28844ecf8513";
  private countryMapper = {AT: "av", DE: "gr", DKC: "DC", ES: "sm", GB: "ln", SG: "sp", US: "us"};

  public getLatestDetails(ticker: string): Instrument {
    // turn the ticker into an asset code by converting the country code and using it as a suffix instead of prefix. eg: SG.CEE turns into CEE.SGP
    let bloombergSymbol  = this.getBloombergSymbolForTicker(ticker);
    let latestStockPrice = this.getLatestAssetPrice(bloombergSymbol);

    if (latestStockPrice == null) {
      return null;
    } else if (latestStockPrice.value == null) {
      return null;
    }

    // return the updated instrument values as a standard Instrument object
    var updatedInstrument = new Instrument(ticker);
    updatedInstrument.setValue(latestStockPrice.value, latestStockPrice.valueDate);
    updatedInstrument.setLastUpdateDate(new Date())

    return updatedInstrument;
  }

  private getBloombergSymbolForTicker(ticker) {
    let matches = ticker.match(this.tickerFormat);

    // reconfigure the ticker to adhere to the Bloomberg format (eg: DE.WEW => WEW:gr, ES.BBVA => BBVA:sm)
    let countryCode = matches[1];
    if (this.countryMapper[countryCode] == undefined) {
      return null;
    }
    countryCode   = this.countryMapper[countryCode];
    let assetCode = matches[2] + ':' + countryCode
    
    // Bloomberg returns the response with uppercase asset code
    return assetCode.toUpperCase();
  }
  
  private getLatestAssetPrice(assetCode) {
    // fetch the latest asset prices from the AlphaVantage API
    const url        = "https://bb-finance.p.rapidapi.com/market/get-compact?id=" + assetCode;
    const reqHeaders = {
      "x-rapidapi-host": "bb-finance.p.rapidapi.com",
      "x-rapidapi-key": this.apiKey,
      "useQueryString": "true",
    };

    let response = this.HTTPClient.getPageContents(url, reqHeaders);

    if (response.getResponseCode() !== 200) {
      throw new Error(
        "Cannot retrieve instrument data for " +
          assetCode +
          ". Reason: " +
          response.getResponseBody(),
      );
    }

    response = JSON.parse(response.getResponseBody());

    if (response["result"][assetCode] === undefined) {
      return null;
    }

    return {
      value: this.getAssetValueFromResponse(assetCode, response),
      valueDate: this.getAssetValueDateFromResponse(assetCode, response)
    };
  }

  private getAssetValueFromResponse(assetCode, responseObj): number {
    if (responseObj["result"][assetCode]["last"] == undefined) {
      return null;
    }

    return Number(responseObj["result"][assetCode]["last"]).valueOf();
  }

  private getAssetValueDateFromResponse(assetCode, responseObj): Date { 
    if (responseObj["result"][assetCode]["lastPriceTime"] == undefined) {
      return null;
    }

    const timestampInMs =
      Number(responseObj["result"][assetCode]["lastPriceTime"]) * 1000;

    return new Date(timestampInMs);
  }
}
