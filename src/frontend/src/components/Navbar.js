import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const handleWalletClick = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">StellarRemit</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Ana Sayfa</Link>
        <Link to="/transfer" className="navbar-item">Transfer</Link>
        <div className="navbar-item">
          <button 
            className={`connect-wallet ${wallet.isConnected ? 'connected' : ''}`}
            onClick={handleWalletClick}
          >
            {wallet.isConnected 
              ? `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`
              : 'Cüzdan Bağla'
            }
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 