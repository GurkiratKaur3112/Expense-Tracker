const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/expenses';

/**
 * Fetch expenses with optional category filter
 * @param {string} [category]
 */
export const fetchExpenses = async (category) => {
  let url = API_BASE_URL;
  if (category && category !== 'all') {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch expenses');
  }

  return data;
};

/**
 * Fetch aggregated category summary
 */
export const fetchExpenseSummary = async () => {
  const res = await fetch(`${API_BASE_URL}/summary`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch expense summary');
  }

  return data;
};

/**
 * Create a new expense
 * @param {{ title: string, amount: number, category: string }} expenseData
 */
export const createExpense = async (expenseData) => {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to create expense');
  }

  return data;
};

/**
 * Delete an expense by ID
 * @param {string} id
 */
export const deleteExpense = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete expense');
  }

  return data;
};
