const express = require('express');
const router = express.Router();
const predictionService = require('../../ai/services/predictionService');

// Optimal transfer zamanı tahmini
router.post('/predict', async (req, res) => {
  try {
    const { amount, sourceCurrency, targetCurrency } = req.body;
    
    // Geçmiş verileri al
    await predictionService.fetchHistoricalRates();
    
    // Tahmin yap
    const prediction = await predictionService.predictOptimalTime(
      amount,
      sourceCurrency,
      targetCurrency
    );

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 