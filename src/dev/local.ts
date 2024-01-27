import { Command } from 'commander';
import { HTTPClientSyncRequest } from '../Services/HTTPClient/HTTPClientSyncRequest';
import { DataRetrieverFX } from '../Services/DataRetriever/DataRetrieverFX';
import { DataRetrieverIndicesROBVB } from '../Services/DataRetriever/DataRetrieverIndicesROBVB';
import { DataRetrieverStocksApiDojoBloomberg } from '../Services/DataRetriever/DataRetrieverStocksApiDojoBloomberg';
import { DataRetrieverStocksRoBVB } from '../Services/DataRetriever/DataRetrieverStocksRoBVB';
import { BulkInstrumentDataRetrievalService } from '../Services/BulkInstrumentDataRetrievalService';
import { Instrument } from '../Models/Instrument';

const program = new Command();

program
  .name('Portfolio update scripts')
  .description('CLI to some JavaScript string utilities');

program.command('update-indexes')
  .description('Grab the latest index and benchmark values from multiples sources')
  .action((str, options) => {
    const instrumentsToUpdate = [
      new Instrument("IX.RO-BET"), 
      new Instrument("IX.RO-BET-TR"),
      new Instrument("IX.RO-BET-FI")
    ];

    const httpClient         = new HTTPClientSyncRequest();
    let dataRetrievalService = new BulkInstrumentDataRetrievalService();
    dataRetrievalService
      .addDataRetriever('indexesRO', new DataRetrieverIndicesROBVB(httpClient));

    updateInstruments(instrumentsToUpdate, dataRetrievalService);
});

program.command('update-fx')
  .description('Grab the latest foreign exchange rates for various currency pairs')
  .action((str, options) => {
    const instrumentsToUpdate = [
      new Instrument("FX.EUR/RON"), 
      new Instrument("FX.SGD/EUR"),
      new Instrument("FX.USD/EUR")
    ];

    const httpClient         = new HTTPClientSyncRequest();
    let dataRetrievalService = new BulkInstrumentDataRetrievalService();
    dataRetrievalService
      .addDataRetriever('fxRates', new DataRetrieverFX(httpClient));
    
    updateInstruments(instrumentsToUpdate, dataRetrievalService);
});

program.command('update-stocks')
  .description('Grab the latest prices for exchange-traded companies (stocks)')
  .action((str, options) => {
    const instrumentsToUpdate = [
      new Instrument("RO.TLV"), 
      new Instrument("RO.SNP"),
      new Instrument("RO.GSH"),
      new Instrument("US.TWKS"),
      new Instrument("AT.BG"),
      new Instrument("AT.EBS"),
      new Instrument("DE.WEW"),
      new Instrument("DE.BCPN")
    ];

    const httpClient         = new HTTPClientSyncRequest();
    let dataRetrievalService = new BulkInstrumentDataRetrievalService();
    dataRetrievalService
      .addDataRetriever('stocksRO', new DataRetrieverStocksRoBVB(httpClient))
      .addDataRetriever('stocksIntl', new DataRetrieverStocksApiDojoBloomberg(httpClient));

    updateInstruments(instrumentsToUpdate, dataRetrievalService);
});

let updateInstruments = function(instrumentsToUpdate: Array<Instrument>, dataRetrievalService: BulkInstrumentDataRetrievalService) {
  // iterate through the instruments, retrieve the latest data for each of them
  // and output the result
  instrumentsToUpdate.forEach(function (instrumentDetails: Instrument) {
    try {
      console.log('Processing instrument with ticker ' + instrumentDetails.getTicker());

      let latestInstrumentData = 
        dataRetrievalService.retrieveLatestDataForSingleInstrument(instrumentDetails); 

      if (latestInstrumentData == null) {
        console.log('No data to retrieve for instrument ' + instrumentDetails.getTicker());
        return;
      }

      console.log(
        'Value for instrument ' + instrumentDetails.getTicker() + ' is ' + 
        latestInstrumentData.getValue() + ' at date ' + instrumentDetails.getValueDate()
      );
    } catch (error) {
      console.error('Error processing instrument ' + instrumentDetails.getTicker() + '. Error:' + error);
    }
  });
}

program.parse();