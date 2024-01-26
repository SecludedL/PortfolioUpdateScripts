import { Instrument } from '../../Models/Instrument'

export abstract class InstrumentRepositoryAbstract {
  protected tickerDictionary: Map<string, Instrument>;

  public abstract getAllInstruments(): Map<string, Instrument>;

  public getInstrumentDataByTicker(lookupTicker: string) {
    var instruments = this.getAllInstruments();
    
    // if the data for this ticker was already looked up, return it
    if (instruments.has(lookupTicker)) {
      return instruments.get(lookupTicker);
    } else {
      return null;
    }
  }
  
  public abstract persistInstrument(instrument: Instrument): boolean;
}
