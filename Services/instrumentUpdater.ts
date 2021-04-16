import { Instrument } from '../Models/instrument';
import { instrumentRepository } from '../Repositories/instrumentRepository';
import { updaterAbstract } from './Updaters/updaterAbstract'

export class instrumentUpdater {
  public updaterPlugins: Map<string, updaterAbstract>;
  
  public constructor() {
    this.updaterPlugins = new Map();
  }
  
  public addPlugin(pluginId: string, updaterPlugin: updaterAbstract): instrumentUpdater {
    this.updaterPlugins.set(pluginId, updaterPlugin);
    
    return this;
  }
  
  public removePlugin(pluginId: string): instrumentUpdater {
    if (this.updaterPlugins.has(pluginId)) {
      this.updaterPlugins.delete(pluginId);
    }
    
    return this;
  }
  
  public resetPlugins() {
    this.updaterPlugins.clear();

    return this;
  }
  
  public retrieveAndUpdateAssetPrices() {
    let instrumentRepo = new instrumentRepository();
    let instrumentsWithUpdaters = this.getInstrumentsMatchingPlugins(instrumentRepo.getAllInstruments());
  
    instrumentsWithUpdaters.forEach((updater, instrument, map) => {
      if (!instrument.needsUpdate()) {
        console.log("Instrument " + instrument.getTicker() + " is already up to date.");
        return;
      }
  
      try {
        let updatedInstrument = updater.getLatestDetails(instrument.getTicker());

        if (!(updatedInstrument instanceof Instrument)) {
          throw new Error("Can't retrieve latest value for instrument: " + instrument.getTicker());
        }

        if (!instrumentRepo.persistInstrument(updatedInstrument)) {
          throw new Error("Can't update instrument in the repository: " + updatedInstrument.getTicker());
        }
      } catch (error) {
        SpreadsheetApp.getUi().alert(error);
        console.error(error);
        return;
      }
    
      console.log("Updated instrument " + instrument.getTicker(), updatedInstrument, updater);
    });
  }

  // return the instruments that match one of updater plugins alongside the corresponding updater
  private getInstrumentsMatchingPlugins(allInstruments: Map<string, Instrument>): Map<Instrument, updaterAbstract> {
    let filteredInstruments = new Map<Instrument, updaterAbstract>();

    allInstruments.forEach((instrument, key, map) => {
        let matchedPlugins = this.getUpdaterPluginsForTicker(instrument.getTicker());

        if (matchedPlugins.length > 0) {
          filteredInstruments.set(instrument, matchedPlugins.pop());
        }
    })

    return filteredInstruments;
  }
  
  private getUpdaterPluginsForTicker(ticker:string): Array<updaterAbstract> {
    let matchedPlugins = new Array();
    
    this.updaterPlugins.forEach((plugin, key, map) => { 
      if (plugin.matchTicker(ticker)) {
        matchedPlugins.push(plugin);
      }
    })
    
    return matchedPlugins;
  }
}