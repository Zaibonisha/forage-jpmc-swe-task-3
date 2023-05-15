import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[0].top_ask.price + serverRespond[1].top_ask.price) / 2;
    const ratio = priceABC / priceDEF;

    // Calculate the 12-month historical average ratio
    const historicalData = serverRespond.slice(2); // Assuming historical data starts from index 2
    const historicalRatios = historicalData.map(data => {
      const historicalPriceABC = (data.top_ask.price + data.top_bid.price) / 2;
      const historicalPriceDEF = (data.top_ask.price + data.top_ask.price) / 2;
      return historicalPriceABC / historicalPriceDEF;
    });
    const averageRatio = historicalRatios.reduce((sum, ratio) => sum + ratio, 0) / historicalRatios.length;

    const upperBound = averageRatio * 1.1;
    const lowerBound = averageRatio * 0.9;

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp
        ? serverRespond[0].timestamp
        : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}



