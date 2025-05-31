const express = require('express');
const router = express.Router();
const stellarService = require('../../blockchain/services/stellarService');

// Yeni kullanıcı hesabı oluştur
router.post('/create-account', async (req, res) => {
  try {
    const account = await stellarService.createAccount();
    
    res.json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcı bakiyesini getir
router.get('/balance/:publicKey', async (req, res) => {
  try {
    const balance = await stellarService.getAccountBalance(req.params.publicKey);
    
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