import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ExpenseForm from './components/ExpenseForm';
import CategoryFilter from './components/CategoryFilter';
import ExpenseList from './components/ExpenseList';
import {
  fetchExpenses,
  fetchExpenseSummary,
  createExpense,
  deleteExpense,
} from './services/api';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load expenses based on selected category filter
  const loadExpenses = useCallback(async (cat = selectedCategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses(cat);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to load expenses from server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Load summary data (aggregation)
  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await fetchExpenseSummary();
      setSummaryData(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
      // We don't block the UI if summary fails, but we log it
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadExpenses('all');
    loadSummary();
  }, []);

  // Handle category filter change
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    loadExpenses(cat);
  };

  // Handle add expense: updates both list and summary
  const handleAddExpense = async (newExpenseData) => {
    await createExpense(newExpenseData);
    // Reload both list and summary
    await Promise.all([
      loadExpenses(selectedCategory),
      loadSummary(),
    ]);
  };

  // Handle delete expense: updates both list and summary
  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    // Reload both list and summary
    await Promise.all([
      loadExpenses(selectedCategory),
      loadSummary(),
    ]);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header />

      {/* Real-time Category & Grand Total Summary Section */}
      <SummaryCards
        summaryData={summaryData}
        isLoading={isSummaryLoading}
      />

      {/* Main Two-Column Interactive Layout */}
      <main className="main-content-layout">
        {/* Left Column: Add Expense Form */}
        <section aria-label="Add Expense">
          <ExpenseForm onAddExpense={handleAddExpense} />
        </section>

        {/* Right Column: Category Filter & Expense History List */}
        <section aria-label="Expense History">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            count={expenses.length}
          />

          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={error}
            onDeleteExpense={handleDeleteExpense}
            selectedCategory={selectedCategory}
            onRetry={() => {
              loadExpenses(selectedCategory);
              loadSummary();
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
