import { Instrument } from "../../Models/Instrument";

export abstract class updaterAbstract {
    protected tickerFormat: RegExp;

    public abstract getLatestDetails(ticker: string): Instrument

    public matchTicker(ticker: string): boolean {
        return ticker.match(this.tickerFormat) ? true : false;
    }
}