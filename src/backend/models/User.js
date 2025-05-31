const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    defaultSourceCurrency: {
      type: String,
      default: 'XLM'
    },
    defaultTargetCurrency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  transactionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 