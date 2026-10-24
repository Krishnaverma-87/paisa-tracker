const mongoose = require('mongoose');
const Expense = mongoose.model('Expense', new mongoose.Schema({
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  date: { type: String, required: true },       // YYYY-MM-DD
  note: { type: String, default: '' }
}, { timestamps: true }));
const Budget = mongoose.model('Budget', new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  limit: { type: Number, required: true, min: 1 }
}));
module.exports = { Expense, Budget };
