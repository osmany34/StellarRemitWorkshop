const { Server, Networks, Keypair, TransactionBuilder, Operation, Asset } = require('@stellar/stellar-sdk');
const server = new Server('https://horizon-testnet.stellar.org');

class StellarService {
  constructor() {
    this.networkPassphrase = Networks.TESTNET;
  }

  async createAccount() {
    const pair = Keypair.random();
    return {
      publicKey: pair.publicKey(),
      secretKey: pair.secret()
    };
  }

  async sendPayment(sourceSecret, destinationPublicKey, amount, asset = 'XLM') {
    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      const account = await server.loadAccount(sourcePublicKey);
      const fee = await server.fetchBaseFee();

      const transaction = new TransactionBuilder(account, {
        fee,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(
          Operation.payment({
            destination: destinationPublicKey,
            asset: Asset.native(),
            amount: amount.toString()
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);

      const result = await server.submitTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error in sendPayment:', error);
      throw error;
    }
  }

  async getAccountBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey);
      return account.balances;
    } catch (error) {
      console.error('Error in getAccountBalance:', error);
      throw error;
    }
  }
}

module.exports = new StellarService(); 