require('dotenv').config();
const mongoose = require('mongoose');
const { Expense, Budget } = require('./models');
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paisa';
const day = (mAgo, d) => { const t = new Date(); t.setDate(1); t.setMonth(t.getMonth() - mAgo); t.setDate(d);
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); };
(async () => {
  await mongoose.connect(URI);
  await Expense.deleteMany({}); await Budget.deleteMany({});
  const docs = [];
  for (let m = 0; m < 6; m++) {
    docs.push({ type: 'income', title: 'Pocket money', amount: 12000, category: 'Income', date: day(m, 1), note: 'Monthly' });
    if (m % 2 === 0) docs.push({ type: 'income', title: 'Freelance project', amount: 3500 + m * 400, category: 'Income', date: day(m, 14), note: '' });
    docs.push(
      { type: 'expense', title: 'Canteen and snacks', amount: 1800 + m * 120, category: 'Food', date: day(m, 5), note: '' },
      { type: 'expense', title: 'Bus pass', amount: 350, category: 'Travel', date: day(m, 3), note: 'Monthly' },
      { type: 'expense', title: 'Mobile recharge', amount: 299, category: 'Bills', date: day(m, 8), note: '28 days plan' },
      { type: 'expense', title: m % 2 ? 'Movie night' : 'Cafe with friends', amount: 600 + m * 90, category: 'Fun', date: day(m, 18), note: '' },
      { type: 'expense', title: 'Books and printouts', amount: 450 + m * 60, category: 'Study', date: day(m, 11), note: '' }
    );
  }
  await Expense.insertMany(docs);
  await Budget.insertMany([{ category: 'Food', limit: 2500 }, { category: 'Fun', limit: 1200 }, { category: 'Study', limit: 800 }, { category: 'Travel', limit: 500 }]);
  console.log('Seeded ' + docs.length + ' transactions and 4 budgets into', URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@'));
  await mongoose.disconnect();
})();
