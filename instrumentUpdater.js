function instrumentUpdater() {
  var updaterPlugins = {};
  
  this.addPlugin = function(pluginId, pluginObject) {
    updaterPlugins[pluginId] = pluginObject;
    
    return this;
  }
  
  this.removePlugin = function(pluginId) {
    if (updaterPlugins[pluginId] !== undefined) {
      updaterPlugins[pluginId] = null;
    }
    
    return this;
  }
  
  this.resetPlugins = function() {
    updaterPlugins = {};
    return this;
  }
  
  this.retrieveAndUpdateAssetPrices = function() {
    var instrumentRepo = new instrumentRepository();
    var allInstruments = instrumentRepo.getAllInstruments();
  
    for (var i in allInstruments) {
      var currentAsset = allInstruments[i];
    
      if (!currentAsset.needsUpdate()) {
        console.log("Instrument " + currentAsset.ticker + " is already up to date.");
        continue;
      }
    
      // if no price updating plugin is available for the ticker, skip to the next asset
      let updaterPlugins = getUpdaterPluginsForTicker(currentAsset.getTicker());
      if (updaterPlugins.length > 1) {
        continue;
      }
     
      for (plugin of updaterPlugins) {
        let updatedInstrument = plugin.getLatestValue(currentAsset.getTicker());
        
        if (!(updatedInstrument instanceof Instrument)) {
          let errorMessage = "Can't find latest value for instrument: " + currentAsset.getTicker();
          SpreadsheetApp.getUi().alert(errorMessage);
          console.warn(errorMessage);
          continue;
        }
           
        console.log(updatedInstrument);
      
        if (!instrumentRepo.persistInstrumentData(updatedInstrument)) {
          let errorMessage = "Can't update instrument in the repository: " + updatedInstrument.getTicker();
          SpreadsheetApp.getUi().alert(errorMessage);
          console.error(errorMessage);
          continue;
        }
    
        console.log("Updated instrument " + currentAsset.ticker, updatedInstrument, plugin);
        break;
      }
    }
  }
  
  var getUpdaterPluginsForTicker = function(ticker) {
    let matchedPlugins = [];
    
    for (var j in updaterPlugins) {
      if (updaterPlugins[j].matchTicker(ticker)) {
        matchedPlugins.push(updaterPlugins[j]);
      }
    }
    
    return matchedPlugins;
  }
}