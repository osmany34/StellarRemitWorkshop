const express = require('express');
const router = express.Router();
const stellarService = require('../../blockchain/services/stellarService');

// Yeni transfer işlemi oluştur
router.post('/', async (req, res) => {
  try {
    const { amount, sourceCurrency, targetCurrency, destinationCountry, recipientAddress } = req.body;
    
    // Stellar işlemini gerçekleştir
    const result = await stellarService.sendPayment(
      process.env.STELLAR_SECRET_KEY,
      recipientAddress,
      amount
    );

    res.json({
      success: true,
      transaction: result,
      message: 'Transfer başarıyla gerçekleştirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transfer geçmişini getir
router.get('/', async (req, res) => {
  try {
    const publicKey = req.query.publicKey;
    const balance = await stellarService.getAccountBalance(publicKey);
    
    res.json({
      success: true,
      balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 