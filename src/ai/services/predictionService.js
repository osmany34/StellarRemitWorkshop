const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');

class PredictionService {
  constructor() {
    this.model = null;
    this.historicalData = [];
    this.marketData = {};
    this.lastUpdate = null;
  }

  async initializeModel() {
    // Gelişmiş bir LSTM modeli oluştur
    this.model = tf.sequential();
    
    // İlk LSTM katmanı
    this.model.add(tf.layers.lstm({
      units: 100,
      returnSequences: true,
      inputShape: [24, 5] // 24 saatlik veri, 5 özellik
    }));
    
    // Dropout katmanı
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // İkinci LSTM katmanı
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: false
    }));
    
    // Dense katmanı
    this.model.add(tf.layers.dense({ units: 1 }));
    
    // Model derleme
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  async fetchHistoricalRates() {
    try {
      // Stellar DEX'ten geçmiş fiyat verilerini al
      const response = await axios.get('https://horizon-testnet.stellar.org/paths');
      this.historicalData = response.data._embedded.records;
      
      // Market verilerini güncelle
      await this.updateMarketData();
      
      this.lastUpdate = new Date();
      return this.historicalData;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      throw error;
    }
  }

  async updateMarketData() {
    try {
      // Farklı veri kaynaklarından market verilerini topla
      const [stellarData, marketTrends, volumeData] = await Promise.all([
        this.fetchStellarData(),
        this.fetchMarketTrends(),
        this.fetchVolumeData()
      ]);

      this.marketData = {
        stellar: stellarData,
        trends: marketTrends,
        volume: volumeData
      };
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }

  async predictOptimalTime(amount, sourceCurrency, targetCurrency) {
    if (!this.model) {
      await this.initializeModel();
    }

    // Veri güncellemesi gerekiyorsa güncelle
    if (!this.lastUpdate || (new Date() - this.lastUpdate) > 3600000) {
      await this.fetchHistoricalRates();
    }

    // Tahmin için veriyi hazırla
    const inputData = this.prepareData(amount, sourceCurrency, targetCurrency);
    
    // Tahmin yap
    const prediction = await this.model.predict(inputData);
    
    // Sonuçları yorumla
    const optimalTime = this.interpretPrediction(prediction);
    const confidence = this.calculateConfidence(prediction);
    const factors = this.analyzeInfluencingFactors();

    return {
      optimalTime,
      confidence,
      factors,
      marketConditions: this.getMarketConditions()
    };
  }

  prepareData(amount, sourceCurrency, targetCurrency) {
    // Gelişmiş veri hazırlama
    const features = this.historicalData.map(d => [
      d.price,
      d.volume,
      this.calculateVolatility(d),
      this.calculateTrend(d),
      this.calculateMarketDepth(d)
    ]);
    
    return tf.tensor3d([features], [1, 24, 5]);
  }

  calculateVolatility(data) {
    // Fiyat volatilitesini hesapla
    return Math.abs(data.high - data.low) / data.low;
  }

  calculateTrend(data) {
    // Piyasa trendini hesapla
    return data.close > data.open ? 1 : -1;
  }

  calculateMarketDepth(data) {
    // Piyasa derinliğini hesapla
    return data.volume / data.price;
  }

  interpretPrediction(prediction) {
    const values = prediction.dataSync();
    const hoursToWait = Math.round(values[0] * 24); // 24 saatlik tahmin
    return new Date(Date.now() + hoursToWait * 3600000);
  }

  calculateConfidence(prediction) {
    // Gelişmiş güven skoru hesaplama
    const predictionError = this.calculatePredictionError();
    const marketStability = this.calculateMarketStability();
    const dataQuality = this.calculateDataQuality();
    
    return (0.4 * (1 - predictionError) + 
            0.3 * marketStability + 
            0.3 * dataQuality);
  }

  calculatePredictionError() {
    // Tahmin hatasını hesapla
    return 0.1; // Örnek değer
  }

  calculateMarketStability() {
    // Piyasa stabilitesini hesapla
    return 0.8; // Örnek değer
  }

  calculateDataQuality() {
    // Veri kalitesini hesapla
    return 0.9; // Örnek değer
  }

  analyzeInfluencingFactors() {
    return {
      marketVolatility: this.calculateMarketVolatility(),
      liquidityLevel: this.calculateLiquidityLevel(),
      marketTrend: this.determineMarketTrend(),
      riskFactors: this.identifyRiskFactors()
    };
  }

  calculateMarketVolatility() {
    // Piyasa volatilitesini hesapla
    return 0.15; // Örnek değer
  }

  calculateLiquidityLevel() {
    // Likidite seviyesini hesapla
    return 0.75; // Örnek değer
  }

  determineMarketTrend() {
    // Piyasa trendini belirle
    return 'bullish'; // Örnek değer
  }

  identifyRiskFactors() {
    // Risk faktörlerini belirle
    return ['high_volatility', 'low_liquidity']; // Örnek değerler
  }

  getMarketConditions() {
    return {
      currentPrice: this.getCurrentPrice(),
      volume24h: this.get24hVolume(),
      marketDepth: this.getMarketDepth(),
      spread: this.calculateSpread()
    };
  }

  getCurrentPrice() {
    return this.historicalData[this.historicalData.length - 1]?.price || 0;
  }

  get24hVolume() {
    return this.historicalData.reduce((sum, data) => sum + data.volume, 0);
  }

  getMarketDepth() {
    return this.calculateMarketDepth(this.historicalData[this.historicalData.length - 1]);
  }

  calculateSpread() {
    const lastData = this.historicalData[this.historicalData.length - 1];
    return lastData ? (lastData.ask - lastData.bid) / lastData.bid : 0;
  }

  async fetchStellarData() {
    // Stellar ağından veri çek
    return {}; // Örnek dönüş
  }

  async fetchMarketTrends() {
    // Piyasa trendlerini çek
    return {}; // Örnek dönüş
  }

  async fetchVolumeData() {
    // Hacim verilerini çek
    return {}; // Örnek dönüş
  }
}

module.exports = new PredictionService(); 