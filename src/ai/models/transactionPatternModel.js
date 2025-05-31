const tf = require('@tensorflow/tfjs-node');

class TransactionPatternModel {
  constructor() {
    this.model = null;
    this.features = 5; // [miktar, kaynak_para, hedef_para, gün_saati, haftanın_günü]
  }

  async buildModel() {
    this.model = tf.sequential();

    // Giriş katmanı
    this.model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      inputShape: [this.features]
    }));

    // Gizli katmanlar
    this.model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));

    // Çıkış katmanı - optimal transfer zamanı için regresyon
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));

    // Model derleme
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  prepareData(transactions) {
    const features = [];
    const targets = [];

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      features.push([
        transaction.amount,
        this.encodeCurrency(transaction.sourceCurrency),
        this.encodeCurrency(transaction.targetCurrency),
        date.getHours() / 24, // Normalize edilmiş saat
        date.getDay() / 7 // Normalize edilmiş gün
      ]);

      // Hedef değer: işlem başarılı mı?
      targets.push(transaction.status === 'completed' ? 1 : 0);
    });

    return {
      inputs: tf.tensor2d(features),
      outputs: tf.tensor2d(targets, [targets.length, 1])
    };
  }

  encodeCurrency(currency) {
    const currencies = ['XLM', 'USD', 'EUR', 'TRY'];
    return currencies.indexOf(currency) / (currencies.length - 1);
  }

  async train(transactions) {
    if (!this.model) {
      await this.buildModel();
    }

    const { inputs, outputs } = this.prepareData(transactions);

    await this.model.fit(inputs, outputs, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
        }
      }
    });
  }

  async predictOptimalTime(amount, sourceCurrency, targetCurrency) {
    if (!this.model) {
      throw new Error('Model henüz eğitilmemiş');
    }

    const now = new Date();
    const input = tf.tensor2d([[
      amount,
      this.encodeCurrency(sourceCurrency),
      this.encodeCurrency(targetCurrency),
      now.getHours() / 24,
      now.getDay() / 7
    ]]);

    const prediction = await this.model.predict(input).data();
    return prediction[0];
  }
}

module.exports = new TransactionPatternModel(); 