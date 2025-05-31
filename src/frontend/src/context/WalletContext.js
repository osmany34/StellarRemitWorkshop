import React, { createContext, useState, useContext, useEffect } from 'react';
import walletService from '../services/walletService';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({
    isConnected: false,
    publicKey: null,
    balance: null,
    error: null
  });

  const connectWallet = async () => {
    try {
      const result = await walletService.connectWallet();
      if (result.success) {
        const balance = await walletService.getBalance(result.publicKey);
        setWallet({
          isConnected: true,
          publicKey: result.publicKey,
          balance,
          error: null
        });
      } else {
        setWallet(prev => ({
          ...prev,
          error: result.error
        }));
      }
    } catch (error) {
      setWallet(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      publicKey: null,
      balance: null,
      error: null
    });
  };

  const refreshBalance = async () => {
    if (wallet.isConnected) {
      try {
        const balance = await walletService.getBalance(wallet.publicKey);
        setWallet(prev => ({
          ...prev,
          balance
        }));
      } catch (error) {
        console.error('Bakiye yenilenemedi:', error);
      }
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde cüzdan bağlantısını kontrol et
    const checkWallet = async () => {
      if (window.freighterApi) {
        const isConnected = await window.freighterApi.isConnected();
        if (isConnected) {
          connectWallet();
        }
      }
    };

    checkWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        refreshBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 