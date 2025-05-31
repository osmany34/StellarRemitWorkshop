const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sourcePublicKey: {
    type: String,
    required: true
  },
  destinationPublicKey: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  sourceCurrency: {
    type: String,
    required: true
  },
  targetCurrency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    required: true
  },
  prediction: {
    optimalTime: Date,
    confidence: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema); 