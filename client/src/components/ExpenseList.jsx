import React, { useState } from 'react';

const CATEGORY_MAP = {
  food: { label: 'Food', badgeClass: 'badge-food', icon: '🍔' },
  travel: { label: 'Travel', badgeClass: 'badge-travel', icon: '✈️' },
  bills: { label: 'Bills', badgeClass: 'badge-bills', icon: '💡' },
  shopping: { label: 'Shopping', badgeClass: 'badge-shopping', icon: '🛍️' },
  other: { label: 'Other', badgeClass: 'badge-other', icon: '📦' },
};

const ExpenseList = ({ expenses, isLoading, error, onDeleteExpense, selectedCategory, onRetry }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await onDeleteExpense(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="card expense-list-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon">📋</span> Expense History
        </h2>
        <p className="card-desc">Recent transactions sorted newest first</p>
      </div>

      {/* 1. Loading UI State */}
      {isLoading && (
        <div className="ui-state-container loading-state">
          <div className="spinner-lg" />
          <p className="state-title">Loading expenses...</p>
          <p className="state-desc">Fetching data from backend server</p>
        </div>
      )}

      {/* 2. Error UI State */}
      {!isLoading && error && (
        <div className="ui-state-container error-state">
          <div className="error-icon-circle">⚠️</div>
          <p className="state-title">Unable to load expenses</p>
          <p className="state-desc">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="btn-secondary mt-3">
              Try Again
            </button>
          )}
        </div>
      )}

      {/* 3. Empty UI State: "No expenses yet" */}
      {!isLoading && !error && expenses.length === 0 && (
        <div className="ui-state-container empty-state">
          <div className="empty-icon-circle">📂</div>
          <p className="state-title">No expenses yet</p>
          <p className="state-desc">
            {selectedCategory && selectedCategory !== 'all'
              ? `No transactions recorded under "${selectedCategory}".`
              : 'Your expense log is clean. Add your first expense above!'}
          </p>
        </div>
      )}

      {/* 4. Populated Expense List Table */}
      {!isLoading && !error && expenses.length > 0 && (
        <div className="table-responsive">
          <table className="expenses-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Category</th>
                <th scope="col">Date</th>
                <th scope="col" className="text-right">Amount</th>
                <th scope="col" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => {
                const catInfo = CATEGORY_MAP[item.category?.toLowerCase()] || {
                  label: item.category || 'Other',
                  badgeClass: 'badge-other',
                  icon: '🏷️',
                };
                const isDeleting = deletingId === item._id;

                return (
                  <tr key={item._id} className="expense-row">
                    <td className="expense-title-cell">
                      <span className="font-semibold">{item.title}</span>
                    </td>
                    <td>
                      <span className={`category-badge ${catInfo.badgeClass}`}>
                        <span className="badge-icon">{catInfo.icon}</span>
                        {catInfo.label}
                      </span>
                    </td>
                    <td className="text-secondary text-sm">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="text-right amount-cell">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-delete"
                        disabled={isDeleting}
                        title={`Delete ${item.title}`}
                        aria-label={`Delete expense ${item.title}`}
                      >
                        {isDeleting ? (
                          <span className="spinner-sm" />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
