import { Instrument } from '../Models/Instrument';
import { DataRetrieverAbstract } from './DataRetriever/DataRetrieverAbstract';

export class BulkInstrumentDataRetrievalService {
  protected dataRetrievers: Map<string, DataRetrieverAbstract>;
  
  public constructor() {
    this.dataRetrievers = new Map();
  }

  // adds a data retriever plugin to the list of plugins and assigns it a unique id
  public addDataRetriever(pluginId: string, dataRetriever: DataRetrieverAbstract): BulkInstrumentDataRetrievalService {
    this.dataRetrievers.set(pluginId, dataRetriever);
    
    return this;
  }
  
  // removes a data retriever plugin from the list of plugins given its unique id
  public removeDataRetriever(pluginId: string): BulkInstrumentDataRetrievalService {
    if (this.dataRetrievers.has(pluginId)) {
      this.dataRetrievers.delete(pluginId);
    }
    
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
    if (!instrument.needsUpdate()) {
      console.log("Instrument " + instrument.getTicker() + " is already up to date.");
      return instrument;
    }

    let updater = this.getDataRetrieverForInstrument(instrument);

    if (updater == null) {
      console.debug("No updater found for instrument: " + instrument.getTicker());
      return null;
    }
    
    console.debug("Updating instrument: " + instrument.getTicker() + " using updater: " + updater.constructor.name);

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

  // return the instruments that match one of updater plugins alongside the corresponding updater
  // private getInstrumentsMatchingPlugins(allInstruments: Map<string, Instrument>): Map<Instrument, DataRetrieverAbstract> {
  //   let filteredInstruments = new Map<Instrument, DataRetrieverAbstract>();

  //   allInstruments.forEach((instrument, key, map) => {
  //       let matchedPlugins = this.getUpdaterPluginsForTicker(instrument.getTicker());

  //       if (matchedPlugins.length > 0) {
  //         filteredInstruments.set(instrument, matchedPlugins.pop());
  //       }
  //   })

  //   return filteredInstruments;
  // }
  
  // return the first data retrieval plugin that matches the given ticker of an instrument
  private getDataRetrieverForInstrument(instrument:Instrument): DataRetrieverAbstract {
    const matchedPlugin = Array
      .from(this.dataRetrievers.values())
      .find(plugin => plugin.matchTicker(instrument.getTicker()));

    return matchedPlugin || null;
  }
}
