const mongoose = require('mongoose');
const Expense = require('../models/Expense');

/**
 * @desc    Create a new expense
 * @route   POST /api/expenses
 * @access  Public
 */
const createExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    // Numerical conversion validation if passed as string
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const expense = new Expense({
      title,
      amount: parsedAmount,
      category: typeof category === 'string' ? category.trim().toLowerCase() : category,
    });

    const savedExpense = await expense.save();
    return res.status(201).json(savedExpense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        message: messages.join('. '),
        errors: messages,
      });
    }

    return res.status(400).json({
      message: error.message || 'Invalid expense data provided',
    });
  }
};

/**
 * @desc    Get all expenses, newest first (with optional category filter)
 * @route   GET /api/expenses
 * @access  Public
 */
const getExpenses = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = category.trim().toLowerCase();
    }

    // Sort newest first by createdAt descending
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to retrieve expenses',
      error: error.message,
    });
  }
};

/**
 * @desc    Get total expense amount grouped by category using MongoDB aggregation
 * @route   GET /api/expenses/summary
 * @access  Public
 */
const getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate category summary',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an expense by ID
 * @route   DELETE /api/expenses/:id
 * @access  Public
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId to prevent server crashes on invalid format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: `Expense not found with id: ${id}`,
      });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({
        message: `Expense not found with id: ${id}`,
      });
    }

    return res.status(200).json({
      message: 'Expense deleted successfully',
      id: deletedExpense._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while deleting expense',
      error: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
};
