import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Örnek public key - gerçek uygulamada kullanıcının public key'i kullanılacak
        const publicKey = 'YOUR_PUBLIC_KEY';
        
        const balanceResponse = await axios.get(`/api/users/balance/${publicKey}`);
        setBalance(balanceResponse.data.balance);

        const transactionsResponse = await axios.get('/api/transactions', {
          params: { publicKey }
        });
        setRecentTransactions(transactionsResponse.data.transactions);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hoş Geldiniz</h1>
        <div className="balance-card">
          <h2>Bakiye</h2>
          <div className="balance-amount">
            {balance ? `${balance} XLM` : 'Yükleniyor...'}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-transactions">
          <h2>Son İşlemler</h2>
          {recentTransactions.length > 0 ? (
            <div className="transactions-list">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-amount">
                    {transaction.amount} {transaction.currency}
                  </div>
                  <div className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  <div className="transaction-status">
                    {transaction.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Henüz işlem bulunmuyor</p>
          )}
        </div>

        <div className="ai-insights">
          <h2>AI Önerileri</h2>
          <div className="insight-card">
            <h3>Optimal Transfer Zamanı</h3>
            <p>En iyi transfer zamanı: <span>Yükleniyor...</span></p>
          </div>
          <div className="insight-card">
            <h3>Döviz Kuru Tahmini</h3>
            <p>24 saat içinde beklenen değişim: <span>Yükleniyor...</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 