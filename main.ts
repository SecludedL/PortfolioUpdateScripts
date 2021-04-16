import { instrumentUpdater } from './Services/instrumentUpdater'
import { updaterFX } from './Services/Updaters/updaterFX';
import { updaterIndexesRo } from './Services/Updaters/updaterIndexesRo'
import { updaterStocksApiDojoBloomberg } from './Services/Updaters/updaterStocksApiDojoBloomberg';
import { updaterStocksRo } from './Services/Updaters/updaterStocksRo'

function updateIndexesAndBenchmarks() {
  var updater = new instrumentUpdater();
  updater
    .resetPlugins()
    .addPlugin('indexesRO', new updaterIndexesRo())
    .retrieveAndUpdateAssetPrices();
}

function updateFxRates() {
  var updater = new instrumentUpdater();
  updater
    .resetPlugins()
    .addPlugin('fxRates', new updaterFX())
    .retrieveAndUpdateAssetPrices();
}

function updateStocks() {
  var updater = new instrumentUpdater();
  updater
    .resetPlugins()
    .addPlugin('stocksRO', new updaterStocksRo())
    .addPlugin('stocksIntl', new updaterStocksApiDojoBloomberg())
    .retrieveAndUpdateAssetPrices();
}