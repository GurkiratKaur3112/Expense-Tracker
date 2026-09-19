# Full-Stack MERN Mini Expense Tracker

A modern, production-ready Full-Stack Expense Tracker application built with the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact, **N**ode.js).

The application allows users to record financial expenses, categorize transactions, view newest expenses first, filter dynamically by category, delete entries with safety checks, and view real-time per-category aggregated spending along with grand totals.

---

## 🏗️ Architecture Diagram

```mermaid
graph TB
    subgraph Client ["Client Layer (React + Vite)"]
        UI["Expense Tracker SPA (App.jsx)"]
        HDR["Header Component"]
        SUMM["SummaryCards Component\n(Real-time Aggregation & Grand Total)"]
        FORM["ExpenseForm Component\n(Validation & Error Handling)"]
        FILT["CategoryFilter Component\n(Dropdown with counts)"]
        LIST["ExpenseList Component\n(Table / Loading / Empty / Error states)"]
        SVC["API Service Layer (services/api.js)"]

        UI --> HDR
        UI --> SUMM
        UI --> FORM
        UI --> FILT
        UI --> LIST
        FORM -->|POST /api/expenses| SVC
        FILT -->|GET /api/expenses?category=...| SVC
        LIST -->|DELETE /api/expenses/:id| SVC
        SUMM -->|GET /api/expenses/summary| SVC
    end

    subgraph Server ["Server Layer (Node.js + Express)"]
        SRV["Express Server (:5000)"]
        MW["Middlewares\n(CORS, express.json, Error Handler)"]
        ROUTER["Expense Router (routes/expenseRoutes.js)"]
        CTRL["Expense Controller (controllers/expenseController.js)"]

        SRV --> MW --> ROUTER --> CTRL
    end

    subgraph Database ["Database Layer (MongoDB)"]
        COLL[("expenses Collection\n(title, amount, category, createdAt)")]
        AGG["Aggregation Pipeline\n($group by category, $sum amount)"]

        CTRL -->|Mongoose ODM| COLL
        CTRL -->|Run Pipeline| AGG
        AGG --> COLL
    end

    SVC <===>|HTTP / JSON (REST API)| SRV
```

### Route Resolution Order Note
In Express, `/api/expenses/summary` is registered **before** `/api/expenses/:id` to prevent the parameterized route from capturing the literal string `"summary"` as an ObjectId.

---

## 📁 Repository Structure

```
Expense Tracker/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Header with branding and MERN badge
│   │   │   ├── SummaryCards.jsx    # Real-time category cards + Grand Total
│   │   │   ├── ExpenseForm.jsx     # Add Expense form with validation
│   │   │   ├── CategoryFilter.jsx  # Dynamic category dropdown filter
│   │   │   └── ExpenseList.jsx     # Table view, delete button, loading/empty/error states
│   │   ├── services/
│   │   │   └── api.js              # Centralized API fetch handlers
│   │   ├── App.css                 # Glassmorphic dark design system styles
│   │   ├── App.jsx                 # Main state orchestration
│   │   ├── index.css               # Global theme tokens & variables
│   │   └── main.jsx                # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Express + Mongoose)
│   ├── config/
│   │   └── db.js                   # Mongoose connection & fallback logic
│   ├── controllers/
│   │   └── expenseController.js    # CRUD handlers & MongoDB $group aggregation
│   ├── models/
│   │   └── Expense.js              # Mongoose Schema with strict validation
│   ├── routes/
│   │   └── expenseRoutes.js        # Express routing
│   ├── .env                        # Environment variables (PORT, MONGODB_URI)
│   ├── .env.example                # Sample environment variables
│   ├── package.json
│   ├── server.js                   # Server bootstrap & global error handlers
│   └── test_api.js                 # Automated API test suite
│
└── README.md                   # Complete documentation & interview discussion
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI. *(If local MongoDB is not running, the server automatically starts an in-memory MongoDB instance for zero-friction evaluation)*.

---

### 1. Backend Setup (`server/`)

```bash
cd server

# Install dependencies (express, mongoose, cors, dotenv)
npm install

# Start development server with auto-reload (nodemon)
npm run dev

# Or start in standard mode:
npm start
```
The server will start on: **`http://localhost:5000`**

#### Environment Variables (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
```
*(For MongoDB Atlas, paste your connection string as `MONGODB_URI`)*.

---

### 2. Frontend Setup (`client/`)

In a separate terminal:
```bash
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The React app will start on: **`http://localhost:5173`**

---

## 📡 API Endpoints Documentation

Base URL: `http://localhost:5000/api/expenses`

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/expenses` | Creates a new expense | `201 Created`, `400 Bad Request` |
| **GET** | `/api/expenses` | Fetches all expenses (newest first). Supports `?category=...` | `200 OK`, `500 Server Error` |
| **GET** | `/api/expenses/summary` | Returns total amount spent per category via `$group` aggregation | `200 OK`, `500 Server Error` |
| **DELETE** | `/api/expenses/:id` | Deletes an expense by its MongoDB ID (validates ObjectId format) | `200 OK`, `404 Not Found` |

### 1. Create Expense
- **Endpoint**: `POST /api/expenses`
- **Request Body**:
  ```json
  {
    "title": "Grocery store run",
    "amount": 64.50,
    "category": "food"
  }
  ```
- **Validation Rules**:
  - `title`: String, required, minimum 2 characters.
  - `amount`: Number, required, strictly greater than 0.
  - `category`: String, required, enum (`food`, `travel`, `bills`, `shopping`, `other`).
- **Response `201 Created`**:
  ```json
  {
    "_id": "660c1d2e...",
    "title": "Grocery store run",
    "amount": 64.5,
    "category": "food",
    "createdAt": "2026-09-19T14:30:00.000Z"
  }
  ```
- **Response `400 Bad Request`**:
  ```json
  {
    "message": "Title must be at least 2 characters long. Amount must be a positive number greater than 0",
    "errors": [...]
  }
  ```

### 2. Get Expenses (with optional category filter)
- **Endpoint**: `GET /api/expenses` or `GET /api/expenses?category=food`
- **Sorting**: Newest first (`{ createdAt: -1 }`)
- **Response `200 OK`**:
  ```json
  [
    {
      "_id": "660c1d2e...",
      "title": "Grocery store run",
      "amount": 64.5,
      "category": "food",
      "createdAt": "2026-09-19T14:30:00.000Z"
    }
  ]
  ```

### 3. Category Summary (MongoDB Aggregation)
- **Endpoint**: `GET /api/expenses/summary`
- **Aggregation Pipeline**:
  ```javascript
  Expense.aggregate([
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $project: { _id: 0, category: "$_id", total: { $round: ["$total", 2] } } },
    { $sort: { category: 1 } }
  ])
  ```
- **Response `200 OK`**:
  ```json
  [
    { "category": "bills", "total": 120.00 },
    { "category": "food", "total": 245.50 },
    { "category": "shopping", "total": 89.99 },
    { "category": "travel", "total": 35.00 }
  ]
  ```

### 4. Delete Expense
- **Endpoint**: `DELETE /api/expenses/:id`
- **Error Handling**: Uses `mongoose.Types.ObjectId.isValid(id)` so the server **never crashes** if an invalid ID string is supplied.
- **Response `200 OK`**:
  ```json
  {
    "message": "Expense deleted successfully",
    "id": "660c1d2e..."
  }
  ```
- **Response `404 Not Found`**:
  ```json
  {
    "message": "Expense not found with id: invalid-id-12345"
  }
  ```

---

## 💬 Part 3: Technical Discussion & Architectural Decisions

### Q1: How would you add login so each user sees only their own expenses?
1. **User Model & Authentication**:
   - Create a `User` schema (`name`, `email` [unique, indexed], `password` [hashed using `bcryptjs` with salt rounds = 10]).
   - Implement `/api/auth/register` and `/api/auth/login` issuing a signed JSON Web Token (**JWT**) or `httpOnly` secure cookie.
2. **Schema Relationship**:
   - Update the `Expense` schema with a `userId` reference field:
     ```javascript
     userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
       index: true
     }
     ```
3. **Authentication Middleware**:
   - Create an `auth` middleware that verifies the JWT from `Authorization: Bearer <token>`, extracts `req.user = decodedUser`, and attaches it to the request.
4. **Data Isolation (Multi-tenancy)**:
   - In all controller queries, scope queries to `req.user.id`:
     - Create: `new Expense({ ...req.body, userId: req.user._id })`
     - Read: `Expense.find({ userId: req.user._id, ...(category ? { category } : {}) })`
     - Summary: Aggregation `$match` stage as step 1: `{ $match: { userId: new mongoose.Types.ObjectId(req.user._id) } }` followed by `$group`.
     - Delete: `Expense.findOneAndDelete({ _id: id, userId: req.user._id })` preventing unauthorized cross-user deletion (returns 404 or 403).

---

### Q2: What would you index in MongoDB, and why?
1. **Compound Index on `{ userId: 1, category: 1, createdAt: -1 }`**:
   - In multi-user setups, every query filters by `userId`, optionally filters by `category`, and sorts by `createdAt: -1`.
   - A compound index following the **Equality, Sort, Range (ESR)** rule allows MongoDB to perform an *Index Scan* (`IXSCAN`) without an in-memory sort stage (`SORT` stage), reducing query execution from $O(N)$ to $O(\log N)$.
2. **Compound Index on `{ category: 1, createdAt: -1 }` (Single-user / Current version)**:
   - Optimizes `GET /api/expenses?category=food` sorted by `createdAt: -1`.
3. **Single Index on `{ createdAt: -1 }`**:
   - Accelerates fetching all expenses without filter, avoiding table scans (`COLLSCAN`).
4. **Index on `{ userId: 1, category: 1, amount: 1 }` for Aggregation**:
   - Provides a **Covered Query** for the `$group` aggregation pipeline, allowing MongoDB to compute totals directly from the index in RAM without accessing disk documents.

---

### Q3: How would you handle pagination if there were 100,000 expenses?
1. **Why `skip()` / `limit()` fails at scale**:
   - Offset pagination (`.skip(99900).limit(100)`) forces MongoDB to read and scan 100,000 index entries into memory and discard 99,900 of them. At scale, this causes high latency and heavy memory pressure.
2. **Keyset / Cursor-based Pagination (Recommended)**:
   - Use natural chronological ordering with `_id` or `createdAt` as a cursor:
     ```javascript
     // Client passes the cursor of the last viewed item:
     // GET /api/expenses?cursor=660c1d2e...&limit=20
     const filter = {};
     if (cursor) {
       filter._id = { $lt: cursor }; // Since _id contains timestamp and is indexed
     }
     const expenses = await Expense.find(filter)
       .sort({ _id: -1 })
       .limit(Number(limit) + 1);
     ```
   - Performance remains constant $O(1)$ lookup regardless of whether you are on page 1 or page 5,000.
3. **Frontend Infinite Scroll / Virtualization**:
   - Implement React Virtualization (`react-window` or `@tanstack/react-virtual`) so that only DOM nodes currently visible in the viewport are rendered, preventing browser DOM lag.

---

### Q4: Why did you structure your code the way you did?
1. **Separation of Concerns (MVC-inspired Architecture)**:
   - **`models/`**: Defines data integrity, types, and schema validations at the database layer.
   - **`controllers/`**: Isolates business logic, status codes, and database interaction.
   - **`routes/`**: Clean endpoint mapping and route parameter ordering.
   - **`config/`**: Decouples environment config and connection lifecycles from app logic.
2. **Centralized Frontend API Service (`services/api.js`)**:
   - Prevents scattering `fetch()` calls with repeated headers and error parsing across UI components.
3. **Modular Component Hierarchy**:
   - `Header`, `SummaryCards`, `ExpenseForm`, `CategoryFilter`, and `ExpenseList` are decoupled, reusable, and testable in isolation.
   - `App.jsx` acts as the single source of truth for expenses and summary state, synchronizing updates between components on add and delete.
4. **Resilience & Fault Tolerance**:
   - ID validation guards against malformed ObjectId crashes.
   - Graceful in-memory fallback for MongoDB guarantees that the application runs out of the box in interview and CI environments.

---

## 🧪 Running Automated Tests

To verify all 4 API endpoints and validation constraints:
```bash
cd server
node test_api.js
```
The test suite validates:
- `POST /api/expenses` valid creation (`201`)
- `POST /api/expenses` schema validation rejection (`400`)
- `GET /api/expenses` newest-first sort (`200`)
- `GET /api/expenses?category=food` query filtering (`200`)
- `GET /api/expenses/summary` `$group` aggregation pipeline (`200`)
- `DELETE /api/expenses/:id` deletion (`200`)
- `DELETE /api/expenses/:id` invalid ObjectId format handling without crash (`404`)
- `DELETE /api/expenses/:id` non-existent ID handling (`404`)
