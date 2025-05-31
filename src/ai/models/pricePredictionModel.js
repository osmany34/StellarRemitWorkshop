const tf = require('@tensorflow/tfjs-node');

class PricePredictionModel {
  constructor() {
    this.model = null;
    this.sequenceLength = 24; // 24 saatlik veri
    this.features = 1; // Fiyat verisi
  }

  async buildModel() {
    this.model = tf.sequential();

    // LSTM katmanları
    this.model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [this.sequenceLength, this.features]
    }));

    this.model.add(tf.layers.dropout({ rate: 0.2 }));

    this.model.add(tf.layers.lstm({
      units: 30,
      returnSequences: false
    }));

    this.model.add(tf.layers.dropout({ rate: 0.2 }));

    // Çıkış katmanı
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

  async train(historicalData) {
    if (!this.model) {
      await this.buildModel();
    }

    // Veriyi hazırla
    const { inputs, outputs } = this.prepareData(historicalData);

    // Modeli eğit
    await this.model.fit(inputs, outputs, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
        }
      }
    });
  }

  prepareData(historicalData) {
    const sequences = [];
    const targets = [];

    for (let i = 0; i < historicalData.length - this.sequenceLength; i++) {
      const sequence = historicalData.slice(i, i + this.sequenceLength);
      const target = historicalData[i + this.sequenceLength];
      sequences.push(sequence.map(d => d.price));
      targets.push(target.price);
    }

    return {
      inputs: tf.tensor3d(sequences, [sequences.length, this.sequenceLength, this.features]),
      outputs: tf.tensor2d(targets, [targets.length, 1])
    };
  }

  async predict(historicalData) {
    if (!this.model) {
      throw new Error('Model henüz eğitilmemiş');
    }

    const lastSequence = historicalData.slice(-this.sequenceLength);
    const input = tf.tensor3d([lastSequence.map(d => d.price)], [1, this.sequenceLength, this.features]);
    
    const prediction = await this.model.predict(input).data();
    return prediction[0];
  }
}

module.exports = new PricePredictionModel(); 