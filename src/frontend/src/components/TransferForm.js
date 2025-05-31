import React, { useState } from 'react';
import axios from 'axios';

const TransferForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    sourceCurrency: 'XLM',
    targetCurrency: 'USD',
    destinationCountry: '',
    recipientAddress: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // AI tahminini al
      const predictionResponse = await axios.post('/api/ai/predict', {
        amount: formData.amount,
        sourceCurrency: formData.sourceCurrency,
        targetCurrency: formData.targetCurrency
      });

      setPrediction(predictionResponse.data);

      // Transfer işlemini başlat
      const transferResponse = await axios.post('/api/transactions', formData);
      console.log('Transfer başarılı:', transferResponse.data);
    } catch (error) {
      console.error('Transfer hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <h2>StellarRemit - Akıllı Havale</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Miktar:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Kaynak Para Birimi:</label>
          <select
            name="sourceCurrency"
            value={formData.sourceCurrency}
            onChange={handleChange}
          >
            <option value="XLM">XLM</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hedef Para Birimi:</label>
          <select
            name="targetCurrency"
            value={formData.targetCurrency}
            onChange={handleChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hedef Ülke:</label>
          <input
            type="text"
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Alıcı Adresi:</label>
          <input
            type="text"
            name="recipientAddress"
            value={formData.recipientAddress}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'İşlem Yapılıyor...' : 'Transfer Başlat'}
        </button>
      </form>

      {prediction && (
        <div className="prediction-info">
          <h3>AI Önerisi</h3>
          <p>Önerilen Transfer Zamanı: {new Date(prediction.optimalTime).toLocaleString()}</p>
          <p>Tahmin Güvenilirliği: %{prediction.confidence * 100}</p>
        </div>
      )}
    </div>
  );
};

export default TransferForm; 