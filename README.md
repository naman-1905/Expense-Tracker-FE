# Expense Tracker Frontend (Next.js)

This is the **Next.js frontend** for the Expense Tracker platform.

It connects to the polyglot backend consisting of:

* Express Auth Service
* FastAPI CRUD Service
* Flask History Service

---

## 📁 Project Structure

Key directories:

```
app/
 ├── (auth)/
 ├── api/
 │    ├── auth/
 │    ├── lib/
 │    └── utils/
 ├── cards/
 ├── context/
 ├── home/
 ├── hooks/
 ├── screens/

public/
```

---

## ⚙️ Environment Setup

The application requires environment variables to connect with backend services.

Create a `.env` file in the root:

```
Expense-Tracker-FE/.env
```

---

## 🔑 Required Environment Variables

Add the following:

```
NEXT_PUBLIC_AUTH_API=
NEXT_PUBLIC_CRUD_API=
NEXT_PUBLIC_HISTORY_API=
NEXT_PUBLIC_CURRENCY_API=
```

---

## 🧪 Example (Production)

```
NEXT_PUBLIC_AUTH_API=https://authexpenses.halfskirmish.com
NEXT_PUBLIC_CRUD_API=https://crudexpenses.halfskirmish.com
NEXT_PUBLIC_HISTORY_API=https://historyexpenses.halfskirmish.com
NEXT_PUBLIC_CURRENCY_API=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
```

---

## 🧑‍💻 Local Development Example

```
NEXT_PUBLIC_AUTH_API=http://localhost:8001
NEXT_PUBLIC_CRUD_API=http://localhost:8000
NEXT_PUBLIC_HISTORY_API=http://localhost:8002
NEXT_PUBLIC_CURRENCY_API=https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json
```

---

## 🚀 Running Locally

Install dependencies:

```
npm install
```

Run dev server:

```
npm run dev
```

App runs at:

```
http://localhost:3000
```

---

## 🔗 Backend Dependency

Make sure all backend services are running:

| Service       | Port |
| ------------- | ---- |
| Express Auth  | 8001 |
| FastAPI CRUD  | 8000 |
| Flask History | 8002 |

---

## 🐳 Docker Support

A Dockerfile is included for containerized deployment.

---

## 🧠 Features

* Auth Flow (Login / Signup / Refresh / Profile)
* Expense & Income Tracking
* Charts & Financial Overview
* Transaction History
* Currency Conversion Support

---

## 📌 Notes

* `NEXT_PUBLIC_*` variables are exposed to the browser.
* Ensure backend URLs are correct.
* `.env` should not be committed to version control.

---

You're ready to run the Expense Tracker Frontend 
