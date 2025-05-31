const User = require('../models/User');
const stellarService = require('../../blockchain/services/stellarService');

exports.createUser = async (req, res) => {
  try {
    const { publicKey } = req.body;

    // Kullanıcı zaten var mı kontrol et
    let user = await User.findOne({ publicKey });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'Bu cüzdan adresi zaten kayıtlı'
      });
    }

    // Yeni kullanıcı oluştur
    user = new User({
      publicKey,
      preferences: {
        defaultSourceCurrency: 'XLM',
        defaultTargetCurrency: 'USD'
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getUserBalance = async (req, res) => {
  try {
    const { publicKey } = req.params;
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
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const { publicKey } = req.params;
    const { preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { publicKey },
      { $set: { preferences } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 