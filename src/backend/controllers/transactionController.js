const Transaction = require('../models/Transaction');
const User = require('../models/User');
const stellarService = require('../../blockchain/services/stellarService');
const predictionService = require('../../ai/services/predictionService');

exports.createTransaction = async (req, res) => {
  try {
    const {
      sourcePublicKey,
      destinationPublicKey,
      amount,
      sourceCurrency,
      targetCurrency
    } = req.body;

    // Tahmin servisinden optimal zamanı al
    const prediction = await predictionService.predictOptimalTime(
      amount,
      sourceCurrency,
      targetCurrency
    );

    // Stellar işlemini gerçekleştir
    const transactionResult = await stellarService.createPayment(
      sourcePublicKey,
      destinationPublicKey,
      amount,
      sourceCurrency,
      targetCurrency
    );

    // Veritabanında işlemi kaydet
    const transaction = new Transaction({
      sourcePublicKey,
      destinationPublicKey,
      amount,
      sourceCurrency,
      targetCurrency,
      transactionHash: transactionResult.hash,
      prediction,
      status: 'pending'
    });

    await transaction.save();

    // Kullanıcının işlem geçmişini güncelle
    await User.findOneAndUpdate(
      { publicKey: sourcePublicKey },
      { $push: { transactionHistory: transaction._id } }
    );

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { publicKey, status, currency, dateRange } = req.query;
    let query = {};

    if (publicKey) {
      query.$or = [
        { sourcePublicKey: publicKey },
        { destinationPublicKey: publicKey }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (currency && currency !== 'all') {
      query.$or = [
        { sourceCurrency: currency },
        { targetCurrency: currency }
      ];
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      switch (dateRange) {
        case 'today':
          query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'week':
          query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'İşlem bulunamadı'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'İşlem bulunamadı'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 