export class Instrument {
  private ticker: string;
  private value: number;
  private valueDate: Date;
  private lastUpdateDate: Date;

  constructor(ticker: string) {
    if (!this.isValidTicker(ticker)) {
      throw 'Invalid ticker used to build Instrument: ' + ticker;
    }
    
    this.ticker = ticker;
  }
  
  public setValue(value: number, valueDate: Date) {
    this.value = value;
    
    if (valueDate instanceof Date) {
      valueDate.setHours(0, 0, 0, 0);
      this.valueDate = valueDate;
    } else {
      this.valueDate = null;
    }
  }
  
  public setLastUpdateDate(lastUpdateDate: Date) {
    if (lastUpdateDate instanceof Date) {
      lastUpdateDate.setHours(0, 0, 0, 0);
      this.lastUpdateDate = lastUpdateDate;
    } else {
      this.lastUpdateDate = null;
    }
  }
  
  public getTicker(): string {
    return this.ticker;
  }
  
  public getValue(): number {
    return this.value; 
  }
  
  public getValueDate(): Date {
    return this.valueDate;
  }
  
  public getLastUpdateDate(): Date {
    return this.lastUpdateDate;
  }
  
  public needsUpdate(): boolean {
    if (!(this.lastUpdateDate instanceof Date)) {
      return true;
    }
    
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return (this.lastUpdateDate < currentDate) ? true : false;
  } 
  
  private isValidTicker(ticker: string) {
    var tickerFormat = /[a-z0-9]{2,3}\.[a-z0-9-]{1,6}/i;
    
    if (!ticker.match(tickerFormat)) { 
      return false;
    }
    
    return true;
  }
}