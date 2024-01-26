import { InstrumentUpdater } from './Services/instrumentUpdater'
import { updaterFX } from './Services/DataRetriever/DataRetrieverFX';
import { updaterIndexesRo } from './Services/DataRetriever/DataRetrieverIndicesROBVB'
import { updaterStocksApiDojoBloomberg } from './Services/Updaters/updaterStocksApiDojoBloomberg';
import { updaterStocksRo } from './Services/Updaters/updaterStocksRo'
import { InstrumentRepositoryGoogleSheets } from './Repositories/InstrumentRepository/GoogleSheets';

function updateIndexesAndBenchmarks() {
  var updater = new InstrumentUpdater(
    new InstrumentRepositoryGoogleSheets()
  );

  updater
    .resetPlugins()
    .addPlugin('indexesRO', new updaterIndexesRo())
    .retrieveAndUpdateAssetPrices();
}

function updateFxRates() {
  var updater = new InstrumentUpdater(
    new InstrumentRepositoryGoogleSheets()
  );
  
  updater
    .resetPlugins()
    .addPlugin('fxRates', new updaterFX())
    .retrieveAndUpdateAssetPrices();
}

function updateStocks() {
  var updater = new InstrumentUpdater(
    new InstrumentRepositoryGoogleSheets()
  );
 
  updater
    .resetPlugins()
    .addPlugin('stocksRO', new updaterStocksRo())
    .addPlugin('stocksIntl', new updaterStocksApiDojoBloomberg())
    .retrieveAndUpdateAssetPrices();
}