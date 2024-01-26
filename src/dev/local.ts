import { Command } from 'commander';
import { HTTPClientSyncRequest } from '../Services/HTTPClient/HTTPClientSyncRequest';
import { DataRetrieverFX } from '../Services/DataRetriever/DataRetrieverFX';
import { DataRetrieverIndicesROBVB } from '../Services/DataRetriever/DataRetrieverIndicesROBVB';
import { DataRetrieverStocksApiDojoBloomberg } from '../Services/DataRetriever/DataRetrieverStocksApiDojoBloomberg';

const program = new Command();

program
  .name('Portfolio update scripts')
  .description('CLI to some JavaScript string utilities');

program.command('update-indexes')
  .description('Grab the latest index and benchmark values from multiples sources')
  .action((str, options) => {
    var roIndexes = ['IX.RO-BET', 'IX.RO-BET-TR', 'IX.RO-BET-TR'];    

    var indexDataRetriever = new DataRetrieverIndicesROBVB(
      new HTTPClientSyncRequest()
    );

    //please write a foreach for roIndexes in TypeScript
    roIndexes.forEach(function (indexTicker) {
        try {
          console.log('Processing index ' + indexTicker);
          var instrumentDetails = indexDataRetriever.getLatestDetails(indexTicker);
          console.log('Value for index ' + indexTicker + ' is ' + instrumentDetails.getValue() + ' at date ' + instrumentDetails.getValueDate());
        } catch (error) {
          console.error('Error processing index ' + indexTicker + '. Error:' + error);
        }
    });
});

program.command('update-fx')
  .description('Grab the latest foreign exchange rates for various currency pairs')
  .action((str, options) => {
    var fxTickers = ['FX.EUR/RON', 'FX.SGD/EUR', 'FX.USD/EUR'];    

    var fxDataRetriever = new DataRetrieverFX(
      new HTTPClientSyncRequest()
    );

    //please write a foreach for roIndexes in TypeScript
    fxTickers.forEach(function (ticker) {
        try {
          console.log('Processing FX pair ' + ticker);
          var instrumentDetails = fxDataRetriever.getLatestDetails(ticker);
          console.log('Value for pair ' + ticker + ' is ' + instrumentDetails.getValue() + ' at date ' + instrumentDetails.getValueDate());
        } catch (error) {
          console.error('Error processing pair ' + ticker + '. Error:' + error);
        }
    });
});

program.command('update-stocks')
  .description('Grab the latest prices for exchange-traded companies (stocks)')
  .action((str, options) => {
    var stockTickers = ["US.TWKS", 'AT.BG', 'AT.EBS', 'DE.WEW', "DE.BCPN"];    

    var stocksDataRetriever = new DataRetrieverStocksApiDojoBloomberg(
      new HTTPClientSyncRequest()
    );

    //please write a foreach for roIndexes in TypeScript
    stockTickers.forEach(function (ticker) {
        try {
          console.log('Processing company with ticker ' + ticker);
          var instrumentDetails = stocksDataRetriever.getLatestDetails(ticker);
          console.log('Value for stock ' + ticker + ' is ' + instrumentDetails.getValue() + ' at date ' + instrumentDetails.getValueDate());
        } catch (error) {
          console.error('Error processing company ' + ticker + '. Error:' + error);
        }
    });
});

program.parse();