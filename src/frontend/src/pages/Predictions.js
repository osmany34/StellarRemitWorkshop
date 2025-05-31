import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';
import '../styles/Predictions.css';

const Predictions = () => {
  const { wallet } = useWallet();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('XLM');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (wallet.isConnected) {
      fetchPredictions();
    }
  }, [wallet.isConnected, selectedCurrency, timeRange]);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('/api/predictions', {
        params: {
          currency: selectedCurrency,
          timeRange: timeRange
        }
      });
      setPredictions(response.data.predictions);
    } catch (error) {
      console.error('Tahminler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#2ecc71';
    if (confidence >= 0.6) return '#f1c40f';
    return '#e74c3c';
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="predictions">
      <h1>Kripto Para Tahminleri</h1>

      <div className="filters">
        <select 
          value={selectedCurrency} 
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          <option value="XLM">XLM</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>

        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="24h">24 Saat</option>
          <option value="7d">7 Gün</option>
          <option value="30d">30 Gün</option>
        </select>
      </div>

      <div className="predictions-grid">
        {predictions.map((prediction, index) => (
          <div key={index} className="prediction-card">
            <div className="prediction-header">
              <h3>{prediction.currency}</h3>
              <span className="prediction-time">
                {new Date(prediction.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="prediction-details">
              <div className="prediction-price">
                <span className="label">Tahmini Fiyat:</span>
                <span className="value">${prediction.predictedPrice.toFixed(2)}</span>
              </div>

              <div className="prediction-confidence">
                <span className="label">Güven Oranı:</span>
                <span 
                  className="value"
                  style={{ color: getConfidenceColor(prediction.confidence) }}
                >
                  %{Math.round(prediction.confidence * 100)}
                </span>
              </div>

              <div className="prediction-factors">
                <span className="label">Etkileyen Faktörler:</span>
                <ul>
                  {prediction.factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="prediction-actions">
              <button 
                className="action-button"
                onClick={() => window.location.href = `/send?currency=${prediction.currency}`}
              >
                Transfer Yap
              </button>
              <button 
                className="action-button secondary"
                onClick={() => window.location.href = `/history?currency=${prediction.currency}`}
              >
                Geçmişi Gör
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Predictions; 