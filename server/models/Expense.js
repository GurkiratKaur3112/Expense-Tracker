const mongoose = require('mongoose');

const allowedCategories = ['food', 'travel', 'bills', 'shopping', 'other'];

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      validate: {
        validator: function (value) {
          return typeof value === 'number' && !isNaN(value) && value > 0;
        },
        message: 'Amount must be a positive number greater than 0',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
      enum: {
        values: allowedCategories,
        message: `Category must be one of: ${allowedCategories.join(', ')}`,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
module.exports.allowedCategories = allowedCategories;
