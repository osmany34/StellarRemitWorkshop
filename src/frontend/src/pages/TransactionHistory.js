import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';
import '../styles/TransactionHistory.css';

const TransactionHistory = () => {
  const { wallet } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    currency: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    if (wallet.isConnected) {
      fetchTransactions();
    }
  }, [wallet.isConnected]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions', {
        params: { publicKey: wallet.publicKey }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('İşlem geçmişi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    return transactions.filter(transaction => {
      if (filters.status !== 'all' && transaction.status !== filters.status) return false;
      if (filters.currency !== 'all' && 
          transaction.sourceCurrency !== filters.currency && 
          transaction.targetCurrency !== filters.currency) return false;
      return true;
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  const filteredTransactions = filterTransactions();

  return (
    <div className="transaction-history">
      <h1>İşlem Geçmişi</h1>
      
      <div className="filters">
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="all">Tüm Durumlar</option>
          <option value="completed">Tamamlandı</option>
          <option value="pending">Beklemede</option>
          <option value="failed">Başarısız</option>
        </select>

        <select name="currency" value={filters.currency} onChange={handleFilterChange}>
          <option value="all">Tüm Para Birimleri</option>
          <option value="XLM">XLM</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="TRY">TRY</option>
        </select>

        <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
          <option value="all">Tüm Zamanlar</option>
          <option value="today">Bugün</option>
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
        </select>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <div key={index} className={`transaction-item ${transaction.status}`}>
              <div className="transaction-info">
                <div className="transaction-amount">
                  {transaction.amount} {transaction.sourceCurrency} → {transaction.targetCurrency}
                </div>
                <div className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="transaction-status">
                {transaction.status}
              </div>
              {transaction.prediction && (
                <div className="transaction-prediction">
                  <div>Önerilen Zaman: {new Date(transaction.prediction.optimalTime).toLocaleString()}</div>
                  <div>Güven: %{Math.round(transaction.prediction.confidence * 100)}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-transactions">İşlem bulunamadı</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 