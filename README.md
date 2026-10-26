# 💰 Paisa Tracker

A full-stack expense tracker to record income and expenses, and see where your money goes. Built with Express, MongoDB, and JavaScript.

## ✨ Features
- Add, edit, and delete income and expense transactions
- Categorize transactions (food, travel, bills, etc.)
- Live summary of total income, expenses, and balance
- Data stored persistently in MongoDB
- Responsive UI built with HTML and CSS
- [Filters / charts / monthly summary]

## 🛠️ Tech Stack
| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | HTML, CSS, JavaScript     |
| Backend    | Node.js, Express.js       |
| Database   | MongoDB with Mongoose     |

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v16 or above)
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/<Krishnaverma-87>/paisa-tracker.git
   cd paisa-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root folder:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/paisa-tracker
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## 🔌 API Endpoints
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/transactions`       | Get all transactions     |
| POST   | `/api/transactions`       | Add a transaction        |
| PUT    | `/api/transactions/:id`   | Update a transaction     |
| DELETE | `/api/transactions/:id`   | Delete a transaction     |

*(Update the routes to match your code.)*

## 📁 Project Structure
```
paisa-tracker/
├── models/        # Mongoose schemas
├── routes/        # Express routes
├── public/        # HTML, CSS, JS frontend
├── server.js      # Entry point
├── package.json
└── README.md
```

## 🔮 Future Improvements
- User authentication
- Budget limits and alerts
- Charts and spending analytics
- Export to CSV/PDF
