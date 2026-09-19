import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">Expense<span className="text-gradient">Tracker</span></h1>
          <p className="brand-subtitle">Track, analyze, and manage your spending effortlessly</p>
        </div>
      </div>
      <div className="header-meta">
        <span className="badge-mern">MERN Stack</span>
      </div>
    </header>
  );
};

export default Header;
