# Expense Tracker

A simple **Full-Stack Expense Tracker** built using the MERN stack.

## Features

* Add expenses
* View all expenses
* Filter by category
* Delete expenses
* View category-wise spending
* View total spending

## Tech Stack

* **Frontend:** React.js, Vite, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose


## Architecture Diagram

<img width="549" height="236" alt="image" src="https://github.com/user-attachments/assets/551acd2d-71a6-494f-8fd8-9a07e7597341" />



## Project Structure

```text
Expense Tracker/
├── client/
│   └── src/
│       ├── components/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── README.md
```

## How It Works

```text
React → Express/Node.js → MongoDB
```

React handles the user interface, Express handles the APIs, and MongoDB stores the expenses.

## API Endpoints

| Method | Endpoint                      | Purpose              |
| ------ | ----------------------------- | -------------------- |
| POST   | `/api/expenses`               | Add expense          |
| GET    | `/api/expenses`               | Get expenses         |
| GET    | `/api/expenses?category=food` | Filter expenses      |
| GET    | `/api/expenses/summary`       | Get spending summary |
| DELETE | `/api/expenses/:id`           | Delete expense       |

## Setup

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Create a `.env` file in `server`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
```

## What I Learned

* Building REST APIs with Express
* Connecting MongoDB using Mongoose
* CRUD operations
* React state management
* MongoDB aggregation
* API validation and error handling

