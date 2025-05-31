import StellarSdk from 'stellar-sdk';

class WalletService {
  constructor() {
    this.server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    this.networkPassphrase = StellarSdk.Networks.TESTNET;
  }

  async connectWallet() {
    try {
      // Freighter cüzdanını kontrol et
      if (window.freighterApi) {
        const isConnected = await window.freighterApi.isConnected();
        if (!isConnected) {
          await window.freighterApi.connect();
        }
        const publicKey = await window.freighterApi.getPublicKey();
        return { success: true, publicKey };
      }
      return { success: false, error: 'Freighter cüzdanı bulunamadı' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBalance(publicKey) {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances;
    } catch (error) {
      throw new Error('Bakiye alınamadı: ' + error.message);
    }
  }

  async signTransaction(transaction) {
    try {
      if (window.freighterApi) {
        const signedTransaction = await window.freighterApi.signTransaction(
          transaction.toXDR(),
          this.networkPassphrase
        );
        return StellarSdk.TransactionBuilder.fromXDR(
          signedTransaction,
          this.networkPassphrase
        );
      }
      throw new Error('Freighter cüzdanı bulunamadı');
    } catch (error) {
      throw new Error('İşlem imzalanamadı: ' + error.message);
    }
  }
}

export default new WalletService(); 