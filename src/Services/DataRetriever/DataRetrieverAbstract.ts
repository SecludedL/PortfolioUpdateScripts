import { Instrument } from "../../Models/Instrument";
import { HTTPClientAbstract } from "../HTTPClient/HTTPClientAbstract";

export abstract class DataRetrieverAbstract {
    protected tickerFormat: RegExp;
    protected HTTPClient: HTTPClientAbstract;

    public constructor(HTTPClient: HTTPClientAbstract) {
        this.HTTPClient = HTTPClient;
    }

    public abstract getLatestDetails(ticker: string): Instrument

    public matchTicker(ticker: string): boolean {
        return ticker.match(this.tickerFormat) ? true : false;
    }
}