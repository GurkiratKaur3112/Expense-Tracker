const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
} = require('../controllers/expenseController');

// Route 1 & 2: POST /api/expenses, GET /api/expenses
router.route('/')
  .post(createExpense)
  .get(getExpenses);

// Route 4: GET /api/expenses/summary (MUST BE DECLARED BEFORE /:id)
router.route('/summary')
  .get(getExpenseSummary);

// Route 3: DELETE /api/expenses/:id
router.route('/:id')
  .delete(deleteExpense);

module.exports = router;
