import React from 'react';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', colorClass: 'cat-food' },
  { id: 'travel', label: 'Travel & Commute', icon: '✈️', colorClass: 'cat-travel' },
  { id: 'bills', label: 'Bills & Utilities', icon: '💡', colorClass: 'cat-bills' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', colorClass: 'cat-shopping' },
  { id: 'other', label: 'Other Expenses', icon: '📦', colorClass: 'cat-other' },
];

const SummaryCards = ({ summaryData, isLoading }) => {
  // Map summary array into key-value map: { food: 120, travel: 50, ... }
  const categoryTotals = (summaryData || []).reduce((acc, item) => {
    if (item && item.category) {
      acc[item.category.toLowerCase()] = item.total || 0;
    }
    return acc;
  }, {});

  // Calculate Grand Total across all categories
  const grandTotal = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <section className="summary-section" aria-label="Expenses Summary">
      <div className="summary-grid">
        {/* Grand Total Card */}
        <div className="summary-card grand-total-card">
          <div className="card-header-row">
            <span className="card-label">Grand Total Spent</span>
            <span className="card-icon-badge">💰</span>
          </div>
          <div className="grand-total-amount">
            {isLoading ? <span className="skeleton-text">Loading...</span> : formatCurrency(grandTotal)}
          </div>
          <p className="card-subtext">Aggregated across all categories</p>
        </div>

        {/* 5 Category Summary Cards */}
        {CATEGORIES.map((cat) => {
          const total = categoryTotals[cat.id] || 0;
          const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;

          return (
            <div key={cat.id} className={`summary-card category-card ${cat.colorClass}`}>
              <div className="card-header-row">
                <span className="card-label">{cat.label}</span>
                <span className="card-category-icon">{cat.icon}</span>
              </div>
              <div className="category-amount">
                {isLoading ? <span className="skeleton-text">...</span> : formatCurrency(total)}
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                  title={`${percentage}% of grand total`}
                />
              </div>
              <div className="category-percentage">
                {percentage}% of total
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SummaryCards;
