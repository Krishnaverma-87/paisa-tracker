require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Expense, Budget } = require('./models');

const app = express();
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paisa';
const EXPENSE_CATS = ['Food', 'Travel', 'Study', 'Bills', 'Fun', 'Health', 'Other'];
const monthOk = m => /^\d{4}-\d{2}$/.test(m || '');

app.use(express.json());
app.use(express.static('public'));

function check(b) {
  if (!['expense', 'income'].includes(b.type)) return 'Invalid type';
  if (!/^[A-Za-z0-9 .,&'-]{2,40}$/.test(b.title || '')) return "Title must be 2-40 characters (letters, numbers, . , & ' -)";
  if (!(Number(b.amount) > 0)) return 'Amount must be greater than 0';
  if (b.type === 'expense' && !EXPENSE_CATS.includes(b.category)) return 'Invalid category';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) return 'Date must look like 2026-10-07';
  return null;
}
const clean = b => ({ type: b.type, title: b.title.trim(), amount: Number(b.amount),
  category: b.type === 'income' ? 'Income' : b.category, date: b.date, note: (b.note || '').slice(0, 120) });

app.get('/api/expenses', async (req, res) => {
  const q = monthOk(req.query.month) ? { date: new RegExp('^' + req.query.month) } : {};
  res.json(await Expense.find(q).sort({ date: -1, createdAt: -1 }));
});
app.post('/api/expenses', async (req, res) => {
  const err = check(req.body); if (err) return res.status(400).json({ error: err });
  res.status(201).json(await Expense.create(clean(req.body)));
});
app.put('/api/expenses/:id', async (req, res) => {
  const err = check(req.body); if (err) return res.status(400).json({ error: err });
  res.json(await Expense.findByIdAndUpdate(req.params.id, clean(req.body), { new: true }));
});
app.delete('/api/expenses/:id', async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id); res.json({ ok: true });
});

// month summary + 6 month trend, computed in MongoDB with aggregation pipelines
app.get('/api/summary', async (req, res) => {
  const month = monthOk(req.query.month) ? req.query.month : new Date().toISOString().slice(0, 7);
  const [y, m] = month.split('-').map(Number);
  const months = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(y, m - 1 - i, 1); months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')); }

  const trendRaw = await Expense.aggregate([
    { $match: { date: { $gte: months[0] + '-01', $lte: month + '-31' } } },
    { $group: { _id: { m: { $substrBytes: ['$date', 0, 7] }, t: '$type' }, total: { $sum: '$amount' } } }
  ]);
  const trend = months.map(mo => ({
    m: mo,
    income: (trendRaw.find(r => r._id.m === mo && r._id.t === 'income') || {}).total || 0,
    spent: (trendRaw.find(r => r._id.m === mo && r._id.t === 'expense') || {}).total || 0
  }));
  const cats = await Expense.aggregate([
    { $match: { date: new RegExp('^' + month), type: 'expense' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
  const byCat = {}; cats.forEach(c => byCat[c._id] = c.total);
  const cur = trend[5];
  res.json({ month, income: cur.income, spent: cur.spent, byCat, trend });
});

app.get('/api/budgets', async (_, res) => res.json(await Budget.find()));
app.put('/api/budgets', async (req, res) => {
  const { category, limit } = req.body;
  if (!EXPENSE_CATS.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  if (!(Number(limit) > 0)) { await Budget.deleteOne({ category }); return res.json({ ok: true }); }
  res.json(await Budget.findOneAndUpdate({ category }, { limit: Number(limit) }, { upsert: true, new: true }));
});

app.get('/api/export', async (_, res) => {
  const all = await Expense.find().sort({ date: -1 });
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  const csv = ['Date,Type,Title,Category,Amount,Note']
    .concat(all.map(x => [x.date, x.type, q(x.title), x.category, x.amount, q(x.note)].join(','))).join('\n');
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=paisa-export.csv' }).send(csv);
});

function listen(port) {
  const s = app.listen(port, () => console.log('Paisa running -> open http://localhost:' + port));
  s.on('error', e => {
    if (e.code === 'EADDRINUSE') { console.log('Port ' + port + ' is busy, trying ' + (port + 1) + ' ...'); listen(port + 1); }
    else throw e;
  });
}
mongoose.connect(URI).then(() => {
  console.log('MongoDB connected ->', URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@'));
  listen(Number(process.env.PORT) || 3000);
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
