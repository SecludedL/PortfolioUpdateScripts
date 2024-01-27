import { BulkInstrumentDataRetrievalService } from './Services/BulkInstrumentDataRetrievalService'
import { InstrumentRepositoryGoogleSheets } from './Repositories/InstrumentRepository/GoogleSheets';
import { HTTPClientGoogleApps } from './Services/HTTPClient/HTTPClientGoogleApps';
import { DataRetrieverIndicesROBVB } from './Services/DataRetriever/DataRetrieverIndicesROBVB';
import { Instrument } from './Models/Instrument';
import { InstrumentRepositoryAbstract } from './Repositories/InstrumentRepository/Abstract';
import { DataRetrieverFX } from './Services/DataRetriever/DataRetrieverFX';
import { DataRetrieverStocksRoBVB } from './Services/DataRetriever/DataRetrieverStocksRoBVB';
import { DataRetrieverStocksFT } from './Services/DataRetriever/DataRetrieverStocksFT';
import { DataRetrieverStocksApiDojoBloomberg } from './Services/DataRetriever/DataRetrieverStocksApiDojoBloomberg';
import { DataRetrieverIndicesFT } from './Services/DataRetriever/DataRetrieverIndicesFT';

/**
 * Updates the indexes and benchmarks values
 */
function updateIndexesAndBenchmarks() {
  const instrumentsRepo     = new InstrumentRepositoryGoogleSheets();
  let   instrumentsToUpdate = instrumentsRepo.getAllInstruments();
  let   instrumentsArray    = Array.from(instrumentsToUpdate.values());

  var dataRetrievalService = new BulkInstrumentDataRetrievalService();
  dataRetrievalService
    .addDataRetriever(new DataRetrieverIndicesROBVB(new HTTPClientGoogleApps()))
    .addDataRetriever(new DataRetrieverIndicesFT(new HTTPClientGoogleApps()));

  updateInstruments(instrumentsArray, dataRetrievalService, instrumentsRepo);
}

/**
 * Updates the foreign exchange rates
 */
function updateFxRates() {
  const instrumentsRepo     = new InstrumentRepositoryGoogleSheets();
  let   instrumentsToUpdate = instrumentsRepo.getAllInstruments();
  let   instrumentsArray    = Array.from(instrumentsToUpdate.values());

  var dataRetrievalService = new BulkInstrumentDataRetrievalService();
  dataRetrievalService
    .addDataRetriever(new DataRetrieverFX(new HTTPClientGoogleApps()));

  updateInstruments(instrumentsArray, dataRetrievalService, instrumentsRepo);
}

/**
 * Updates the stock prices section
 */
function updateStocks() {
  const instrumentsRepo     = new InstrumentRepositoryGoogleSheets();
  let   instrumentsToUpdate = instrumentsRepo.getAllInstruments();
  let   instrumentsArray    = Array.from(instrumentsToUpdate.values());

  var dataRetrievalService = new BulkInstrumentDataRetrievalService();
  dataRetrievalService
    .addDataRetriever(new DataRetrieverStocksRoBVB(new HTTPClientGoogleApps()))
    .addDataRetriever(new DataRetrieverStocksApiDojoBloomberg(new HTTPClientGoogleApps()))
    .addDataRetriever(new DataRetrieverStocksFT(new HTTPClientGoogleApps()));

  updateInstruments(instrumentsArray, dataRetrievalService, instrumentsRepo);
}

let updateInstruments = function(
  instrumentsToUpdate: Array<Instrument>, 
  dataRetrievalService: BulkInstrumentDataRetrievalService,
  instrumentsRepo: InstrumentRepositoryAbstract
) {
  instrumentsToUpdate.forEach(instrument => {
    try {
      console.log('[START] Processing instrument with ticker ' + instrument.getTicker());

      let latestInstrumentData = 
        dataRetrievalService.retrieveLatestDataForSingleInstrument(instrument); 

      if (latestInstrumentData == null) {
        console.log('[NOOP] No data to retrieve for instrument ' + instrument.getTicker());
        return;
      }

      console.log(
        'Value for instrument ' + latestInstrumentData.getTicker() + ' is ' + 
        latestInstrumentData.getValue() + ' at date ' + latestInstrumentData.getValueDate()
      );

      instrumentsRepo.persistInstrument(latestInstrumentData);

      if (latestInstrumentData == null) {
        console.log('[DONE] Done updating ' + instrument.getTicker());
      }
    } catch (error) {
      let errorMessage = '[ERROR] Error processing instrument ' + instrument.getTicker() + '. Error:' + error;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  });
}
