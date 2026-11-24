# QueryPilot 🚀

> **AI-Powered SQL Database Query Workspace & Developer Studio**

QueryPilot is a modern, developer-grade SQL workspace featuring an interactive query editor, database schema browser, sortable/searchable results table with CSV export, query history/saved queries, and an **AI Query Assistant** that transforms natural language questions into production-grade SQL.

The application works **instantly in Demo Mode** out of the box with zero external dependencies, credentials, or paid API keys. It runs on a fast, realistic in-memory SQLite database seeded with e-commerce, cloud infrastructure, and customer data.

---

## ✨ Features

- **⚡ Instant Demo Mode (No API keys required):** Boots immediately with realistic seeded tables (`customers`, `orders`, `products`, `categories`, `order_items`, `reviews`).
- **🤖 AI Query Assistant:**
  - Converts natural language questions (e.g., *"Show the top 10 customers by revenue"*) into SQL.
  - Generates clear, plain-language explanations of joins, aggregations, and clauses.
  - Action buttons to **Insert into Editor** or **Run Immediately**.
  - Includes quick prompt chips for common analytics workflows.
  - **Graceful Fallback:** If no OpenAI or Gemini key is configured, uses a smart schema-aware offline demo engine clearly labeled as demo mode.
- **💻 Pro SQL Editor:**
  - Full syntax highlighting, line numbers, and bracket matching powered by CodeMirror.
  - Quick action toolbar: **Run**, **Format SQL**, **Clear**, and **Save to Library**.
  - Keyboard shortcut: <kbd>Cmd</kbd> + <kbd>Enter</kbd> (Mac) or <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (Windows/Linux) to run.
- **📊 Interactive Results Table:**
  - Real-time client-side search/filter across result rows.
  - Column sorting (ascending, descending, neutral).
  - Row counts, precision execution timing in milliseconds (`ms`), and timestamps.
  - **One-click Export:** Download as RFC 4180 CSV, copy as JSON, or copy SQL query.
  - Horizontal scrolling for wide tables and custom scrollbars.
- **🛡️ Safety Guard & Destructive Query Protection:**
  - Automatically identifies destructive statements (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `UPDATE`, `INSERT`).
  - Halts execution with an interactive warning modal requiring explicit confirmation.
  - One-click **Reset Seed** button to restore demo data at any time.
- **🗂️ Searchable Schema Tree:**
  - Real-time search filter for tables and columns.
  - Displays column data types (`INTEGER PK`, `VARCHAR`, `REAL`, `DATETIME`) and foreign key relationships.
  - Quick table preview (`SELECT * LIMIT 10`) on click.
- **📜 Query History & Saved Queries:**
  - Automatic logging of recent executions with status, execution time, and row count.
  - Saved queries library with custom titles and notes.
  - Persisted locally across browser refreshes via `localStorage`.
- **🌓 Dark & Light Theme:**
  - High-contrast workbench styling inspired by Supabase Studio and Datagrip with a clean theme switcher.

---

## 🏗️ Architecture & Tech Stack

```
querypilot/
├── client/                     # Frontend (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/         # Modular UI components
│   │   │   ├── layout/         # Header, Sidebar (Schema Tree, Starter Queries)
│   │   │   ├── editor/         # CodeMirror SQL Editor & Action Toolbar
│   │   │   ├── results/        # Sortable ResultTable & Export tools
│   │   │   ├── ai/             # AI Assistant drawer & Prompt chips
│   │   │   ├── history/        # History & Saved queries library
│   │   │   └── common/         # Destructive confirmation modal & Toasts
│   │   ├── context/            # QueryPilotContext (Global State & Handlers)
│   │   ├── types/              # TypeScript interfaces (Schema, QueryResult, AI)
│   │   ├── utils/              # RFC 4180 CSV Exporter, LocalStorage helpers
│   │   ├── App.tsx             # Main Workbench Layout
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts          # Vite config with /api proxy to backend
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts   # SQLite engine & database manager
│   │   │   ├── seed.ts         # Rich sample dataset
│   │   │   └── safety.ts       # AST/Token safety parser for destructive SQL
│   │   ├── ai/
│   │   │   ├── service.ts      # AI provider coordinator
│   │   │   ├── demoGenerator.ts# Smart offline natural language SQL generator
│   │   │   └── providers.ts    # OpenAI & Google Gemini adapters
│   │   ├── routes/             # REST endpoints (/api/query, /api/schema, /api/ai)
│   │   ├── config.ts           # Environment configuration loader
│   │   └── index.ts            # Express server entry point & static SPA host
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                # Root orchestration scripts
├── .env.example                # Example environment variables
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (Node 20+ or Node 26 recommended)
- **npm**: v9.0.0 or later

### Quick Start (Development Mode)

1. Clone or open the project folder in your terminal:
   ```bash
   cd querypilot
   ```

2. Install all dependencies (root, backend, and frontend):
   ```bash
   npm run install:all
   ```

3. Start both backend and frontend concurrently in development mode:
   ```bash
   npm run dev
   ```

4. Open your browser:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

*(In development, Vite automatically proxies any `/api` requests to the Express backend on port 3001.)*

---

### Production Build & Run

To test or deploy QueryPilot as a unified production build:

```bash
# 1. Build both server and client
npm run build

# 2. Start the unified production server
npm start
```

Now open [http://localhost:3001](http://localhost:3001). The backend serves the compiled React single-page app and handles all API routes from a single port.

---

## 🤖 Optional AI Configuration

By default, QueryPilot runs in **Demo Mode**, using its built-in rule and semantic matching engine to respond to English questions with realistic SQL and explanations. **No API key is needed to explore the app.**

If you wish to connect real cloud LLMs (such as OpenAI or Google Gemini):

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and set your preferred provider:

   **For OpenAI:**
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...your-key...
   OPENAI_MODEL=gpt-4o-mini
   ```

   **For Google Gemini:**
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...your-key...
   ```

3. Restart the server:
   ```bash
   npm run dev
   ```

> [!IMPORTANT]
> **Responsible AI Review**: All SQL generated by an AI model is treated as untrusted input. QueryPilot presents the generated query in the assistant drawer for review before it is inserted into the editor or run against the database. API keys are kept strictly on the backend and are never sent to the browser.

---

## 🗄️ Database Schema & Seed Data

The seeded demo database models a modern tech commerce & cloud platform:

| Table | Description | Sample Columns |
| :--- | :--- | :--- |
| `customers` | Registered accounts & organizations | `id`, `name`, `email`, `country`, `customer_tier`, `lifetime_spend` |
| `categories` | Product departments | `id`, `name`, `department`, `description` |
| `products` | Cloud instances, hardware, licenses | `id`, `name`, `category_id`, `price`, `stock_quantity`, `rating` |
| `orders` | Customer checkout transactions | `id`, `customer_id`, `order_date`, `status`, `total_amount`, `payment_method` |
| `order_items` | Individual line items per order | `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `discount_percent` |
| `reviews` | Customer ratings & feedback | `id`, `product_id`, `customer_id`, `rating`, `comment`, `review_date` |

### Sample Queries to Try

- **Top Customers by Spend:**
  ```sql
  SELECT c.name, c.customer_tier, c.country, ROUND(SUM(o.total_amount), 2) AS total_spend
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name, c.customer_tier, c.country
  ORDER BY total_spend DESC LIMIT 5;
  ```
- **Monthly Revenue:**
  ```sql
  SELECT strftime('%Y-%m', order_date) AS month, COUNT(id) AS orders, ROUND(SUM(total_amount), 2) AS revenue
  FROM orders GROUP BY month ORDER BY month ASC;
  ```
- **Low Stock Inventory:**
  ```sql
  SELECT name, stock_quantity, price FROM products WHERE stock_quantity < 50 ORDER BY stock_quantity ASC;
  ```

---

## 🔌 Connecting a Real External Database

QueryPilot's database access is isolated behind `server/src/db/connection.ts`. To connect PostgreSQL, MySQL, or ClickHouse:

1. Install the corresponding Node driver (e.g. `npm install pg @types/pg --prefix server`).
2. Implement the standard interface:
   ```ts
   export interface QueryExecutionResult {
     success: boolean;
     columns: string[];
     rows: Record<string, any>[];
     rowCount: number;
     executionTimeMs: number;
     statementType: string;
   }
   ```
3. Set `DATABASE_URL` in your `.env` file. Keep connection credentials on the server side only.

---

## 📦 Publishing to GitHub

To publish this project to your GitHub account:

```bash
# 1. Initialize git in the project root (if not already initialized)
cd querypilot
git init

# 2. Add all files
git add .

# 3. Create your initial commit
git commit -m "Initial commit: QueryPilot AI-Powered SQL Database Workspace"

# 4. Create a repository on GitHub (e.g. via github.com or GitHub CLI)
# If using GitHub CLI:
# gh repo create querypilot --public --source=. --push

# Or if using standard git remote:
git branch -M main
git remote add origin https://github.com/<your-username>/querypilot.git
git push -u origin main
```

---

## 📄 License

MIT License. Created with ❤️ for developers, data analysts, and engineering teams.
