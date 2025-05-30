import { Instrument } from '../Models/Instrument';
import { DataRetrieverAbstract } from './DataRetriever/DataRetrieverAbstract';

export class BulkInstrumentDataRetrievalService {
  protected dataRetrievers: Map<string, DataRetrieverAbstract>;
  
  public constructor() {
    this.dataRetrievers = new Map();
  }

  // adds a data retriever plugin to the list of plugins and assigns it a unique id
  public addDataRetriever(dataRetriever: DataRetrieverAbstract): BulkInstrumentDataRetrievalService {
    this.dataRetrievers.set(dataRetriever.constructor.name, dataRetriever);
    
    return this;
  }

  // removes all data retriever plugins
  public resetDataRetrievers() {
    this.dataRetrievers.clear();

    return this;
  }

  // attempts to retrieve the latest data for the instrument provided and
  // returns the updated instrument or null if no data retriever was found for the 
  // instrument or if the data retriever failed to retrieve the latest data 
  public retrieveLatestDataForSingleInstrument(instrument: Instrument): Instrument {
    let updater = this.getDataRetrieverForInstrument(instrument);

    if (updater == null) {
      console.log("No updater found for instrument: " + instrument.getTicker());
      return null;
    }

    if (!instrument.needsUpdate()) {
      console.log("Instrument " + instrument.getTicker() + " is already up to date.");
      return instrument;
    }
    
    console.log("Updating instrument " + instrument.getTicker() + " using updater " + updater.constructor.name);

    let updatedInstrument = updater.getLatestDetails(instrument.getTicker());

    if (!(updatedInstrument instanceof Instrument)) {
      throw new Error("Can't retrieve latest value for instrument: " + instrument.getTicker());
    }

    instrument.setValue(updatedInstrument.getValue(), updatedInstrument.getValueDate());
    instrument.setLastUpdateDate(new Date());

    return instrument
  };
  
  // attempts to retrieve the latest data for all instruments provided
  public retrieveLatestDataForMultipleInstruments(instruments: Array<Instrument>): Array<Instrument> {
    instruments.forEach((instrument) => {
      instrument = this.retrieveLatestDataForSingleInstrument(instrument);
    });

    return instruments;
  }

  // return the first data retrieval plugin that matches the given ticker of an instrument
  private getDataRetrieverForInstrument(instrument:Instrument): DataRetrieverAbstract {
    const matchedPlugin = Array
      .from(this.dataRetrievers.values())
      .find(plugin => plugin.matchTicker(instrument.getTicker()));

    return matchedPlugin || null;
  }
}
