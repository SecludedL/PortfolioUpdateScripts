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
    .addPlugin('stocksIntl', new updaterStocksApiDojoBloomberg());
  updater.retrieveAndUpdateAssetPrices();
}