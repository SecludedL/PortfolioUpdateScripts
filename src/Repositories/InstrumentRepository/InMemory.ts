import { Instrument } from '../../Models/Instrument'
import { InstrumentRepositoryAbstract } from './Abstract'

export abstract class InstrumentRepositoryInMemory extends InstrumentRepositoryAbstract {

  public getAllInstruments(): Map<string, Instrument> {
    return this.tickerDictionary;
  };
  
  public persistInstrument(instrument: Instrument): boolean {
    this.tickerDictionary.set(instrument.getTicker(), instrument);

    return true;
  };
}
