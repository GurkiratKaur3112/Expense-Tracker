import React, { useState } from 'react';

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'bills', label: 'Bills' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const ExpenseForm = ({ onAddExpense }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side quick checks before hitting API
    if (!title.trim() || title.trim().length < 2) {
      setErrorMessage('Title must be at least 2 characters long.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Amount must be a positive number greater than 0.');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a valid category.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddExpense({
        title: title.trim(),
        amount: numAmount,
        category,
      });

      // Clear the form after a successful submit
      setTitle('');
      setAmount('');
      setCategory('food');
      setSuccessMessage('Expense added successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      // Show an error message if the API rejects the data
      setErrorMessage(err.message || 'Failed to add expense. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card expense-form-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon">➕</span> Add New Expense
        </h2>
        <p className="card-desc">Log your transaction to keep your budget up to date</p>
      </div>

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <span className="alert-icon">✅</span>
          <span className="alert-text">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="expense-form" noValidate>
        <div className="form-group">
          <label htmlFor="expense-title">Expense Title</label>
          <input
            id="expense-title"
            type="text"
            placeholder="e.g. Grocery shopping, Metro card"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            autoComplete="off"
          />
          <span className="field-hint">Minimum 2 characters</span>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="expense-amount">Amount ($)</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <span className="field-hint">Must be greater than 0</span>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <span className="field-hint">Select a category</span>
          </div>
        </div>

        <button
          id="btn-submit-expense"
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-sm" /> Adding Expense...
            </>
          ) : (
            <>
              <span>Add Expense</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
