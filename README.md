<h1 align="center">🚗 Parkfinder</h1>

<p align="center">
  A state-of-the-art, feature-rich, and secure <strong>Full-Stack Urban Parking Management System</strong>. Designed to solve modern urban parking availability, search, and reservation challenges, Parkfinder provides an interactive, role-based platform for Users and Administrators. Built using high-performance technologies like <strong>React 19</strong>, <strong>Vite</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS v4</strong>, and <strong>Express.js</strong>.
</p>

<p align="center">
  <a href="https://github.com/imanchalsing/parkfinder">
    <img src="https://img.shields.io/badge/SSOC_26-Contributing-FF5733?style=for-the-badge&logo=github" alt="Social Summer of Code 2026" />
  </a>
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Express.js-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-9.0-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">
  <strong>🔗 Live Demo: <a href="https://parkfinder-three.vercel.app/" target="_blank">parkfinder-three.vercel.app</a></strong>
</p>

---

## 📌 Table of Contents

- [🚀 Key Features](#-key-features)
  - [🔐 Authentication & Authorization](#-authentication--authorization)
  - [🗺️ Interactive Locator & Search](#️-interactive-locator--search)
  - [📅 Booking & Reservation System](#-booking--reservation-system)
  - [📊 Analytics & Dashboards](#-analytics--dashboards)
  - [👑 Admin Control Panel](#-admin-control-panel)
  - [🎫 Ticket & Export Utilities](#-ticket--export-utilities)
- [🛠️ Tech Stack & Ecosystem](#️-tech-stack--ecosystem)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [📈 Application Workflow](#-application-workflow)
- [⚙️ Local Setup Guide](#️-local-setup-guide)
  - [Pre-requisites](#pre-requisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [� Security & Environment Variables](#-security--environment-variables)
- [�📁 Project Directory Structure](#-project-directory-structure)
- [☁️ Deploy on Render / Vercel](#️-deploy-on-render--vercel)
- [🤝 Contributing (SSOC '26)](#-contributing-ssoc-26)
- [⭐ Show Your Support](#-show-your-support)
- [👤 Author](#-author)

---

## 🚀 Key Features

Parkfinder provides a tailored experience with role-based access for drivers and parking administrators.

### 🔐 Authentication & Authorization

- **Secure JWT Authentication**: Tokens stored securely in context memory for session persistence.
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard Users and system Admins.
- **Security Standards**: Hashed user passwords using Bcrypt / BcryptJS, route protection middlewares, and CORS origin controls.
- **Password Recovery**: Complete secure email workflow for Forgot/Reset passwords utilizing Nodemailer.
- **Environment-Based Secrets**: JWT and admin secrets managed through secure environment variables (no hardcoded keys).

### 🗺️ Interactive Locator & Search

- **Dual Layout Grid**: Seamless toggle between interactive Map (Leaflet) and list card formats.
- **Live Filtering**: Sort parking lots instantly based on location, price, rating, safety level, covered status, and slot availability.
- **Proximity Calculation**: Displays approximate distances from central locations to make booking decisions easier.

### 📅 Booking & Reservation System

- **Dynamic Slot Counter**: Real-time decrement of available slots as new bookings are committed.
- **Log Management**: Vehicle Entry & Exit tracking to log vehicle location logs and elapsed durations.
- **Immediate Receipts**: Instant reservation confirmations containing invoice amounts.

### 📊 Analytics & Dashboards

- **User Dashboard**: Real-time tracker for total bookings, active parking logs, spent history, and recent logs.
- **Interactive Visualizations**: Clean Recharts graphs displaying analytics summaries.

### 👑 Admin Control Panel

- **Database Oversight**: Superuser dashboard controls to create, modify, and delete parking locations.
- **User Management**: Monitor list logs of registered drivers, manage login credentials, and handle role assignments.
- **System Diagnostics**: Detailed tables showing system metrics and vehicle entry/exit history.

### 🎫 Ticket & Export Utilities

- **PDF Ticket Exports**: Client-side ticket printing module converting HTML elements into PDF downloads via `jsPDF` and `html2canvas`.

---

## 🛠️ Tech Stack & Ecosystem

### Frontend

- **Library**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & custom CSS modules
- **Routing**: [React Router v7](https://reactrouter.com/) (includes protected client-side routes)
- **Map Integrations**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Data Visualizations**: [Recharts](https://recharts.org/) & [Chart.js](https://www.chartjs.org/)
- **Asset Management**: [Lucide React](https://lucide.dev/) (sleek modern icons)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (smooth state transitions)
- **PDF Exporter**: `jsPDF` & `html2canvas`

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/) (highly performing router)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (ODM)
- **Encryption**: JSON Web Tokens (JWT) & BcryptJS
- **Notifications**: Nodemailer (SMTP configs for transactional mails)

---

## 📈 Application Workflow

The diagram below represents how different components of the Parkfinder architecture communicate:

```mermaid
flowchart TD
    subgraph Client ["Client-Side (React 19 SPA)"]
        User["User / Admin Client"] --> Frontend["React / Vite SPA"]
        Frontend --> Context["Auth Context"]
        Frontend --> Views["Map / Dashboard / Slots"]
    end

    subgraph Network ["Network Layer"]
        Views -- "HTTP requests with JWT" --> Axios["Axios Instance"]
    end

    subgraph Server ["Backend Server (Express.js)"]
        Axios --> Express["Express Server & Routes"]
        Express --> AuthM["Auth Middleware Guard"]
        AuthM --> Controllers["Controllers (Auth, Booking, Admin)"]
    end

    subgraph Data ["Database & Utilities"]
        Controllers --> DB[("MongoDB (Mongoose)")]
        Controllers --> Mailer["Nodemailer SMTP Service"]
    end

    classDef client fill:#0b3c5d,stroke:#328cc1,stroke-width:2px,color:#fff;
    classDef server fill:#1d2731,stroke:#f9d5bb,stroke-width:2px,color:#fff;
    classDef database fill:#05386b,stroke:#5cdb95,stroke-width:2px,color:#fff;

    class User,Frontend,Context,Views client;
    class Express,AuthM,Controllers server;
    class DB,Mailer database;
```

Below is the standard sequence of actions for user registration and booking reservation:

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Driver (UI)
    participant Client as React Client
    participant Server as Express Server
    participant DB as MongoDB

    Driver->>Client: Open Explorer & Select Slot
    Client->>Server: POST /api/bookings (JWT + Body)
    Note over Server: Run Auth Middleware & verify JWT
    Server->>DB: Check availability & create booking
    DB-->>Server: Saved booking record
    Server->>DB: Decrement Parking.availableSlots
    Server-->>Client: Booking success response
    Client-->>Driver: Renders confirmation & enables PDF download ticket
```

---

## ⚙️ Local Setup Guide

Follow these steps to run a copy of the project locally on your machine.

### Pre-requisites

- **Node.js** (v18.x or above recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)
- **NPM** or **Yarn**

### 1. Backend Setup

1. Navigate to the backend server directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration file:
   Create a `.env` file in the `server/` directory and paste the following configurations:

   ```env
   # Required - Security Configuration
   JWT_SECRET=your-secure-random-jwt-secret-key-min-32-chars
   ADMIN_SECRET=your-secure-admin-secret-key-min-32-chars

   # Server Configuration
   PORT=5000

   # Database Configuration
   MONGO_URI=mongodb://127.0.0.1:27017/parkfinder

   # Frontend Configuration
   FRONTEND_URL=http://localhost:5173

   # Email/SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=example@gmail.com
   SMTP_PASS=your_smtp_app_password
   SMTP_SECURE=false
   EMAIL_FROM=no-reply@parkfinder.com
   ```

   ⚠️ **IMPORTANT SECURITY NOTES:**
   - **NEVER** commit the `.env` file to version control
   - Use strong, random strings for `JWT_SECRET` and `ADMIN_SECRET` (minimum 32 characters)
   - Generate secure secrets using: `openssl rand -base64 32`
   - A `.env.example` file is provided as a template for reference

4. Seed the database with default parking slot records:
   ```bash
   node seed.js
   ```
5. Start the Express development server:
   ```bash
   npm run dev
   ```
   _The API will start running on_ `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal window/tab and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create your frontend environment configuration file:
   Inside `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the React/Vite development server:
   ```bash
   npm run dev
   ```
   _The client app will compile and start running on_ `http://localhost:5173`

---

## � Security & Environment Variables

### Critical Security Configuration

ParkFinder requires secure environment variables for JWT token signing and admin account protection. These should **never** be hardcoded in your application.

#### Required Variables

| Variable       | Purpose                                   | Generation                |
| -------------- | ----------------------------------------- | ------------------------- |
| `JWT_SECRET`   | Sign and verify JWT authentication tokens | `openssl rand -base64 32` |
| `ADMIN_SECRET` | Validate admin account creation requests  | `openssl rand -base64 32` |

#### Setup Instructions

1. **Create `.env` file in the `server/` directory:**

   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets:**

   ```bash
   # On Mac/Linux
   openssl rand -base64 32  # Use output for JWT_SECRET
   openssl rand -base64 32  # Use output for ADMIN_SECRET
   ```

3. **Update `.env` with generated values:**

   ```env
   JWT_SECRET=<your-generated-secret-here>
   ADMIN_SECRET=<your-generated-secret-here>
   ```

4. **Verify `.env` is NOT tracked by Git:**

   ```bash
   # Already included in .gitignore (do not remove)
   echo ".env" >> .gitignore
   ```

5. **Start the server** - It will validate environment variables at startup:

   ```bash
   npm run dev
   ```

   If variables are missing, you'll see:

   ```
   ❌ FATAL ERROR: Missing required environment variables: JWT_SECRET, ADMIN_SECRET
      Please set these in your .env file or system environment.
   ```

#### Production Deployment

When deploying to **Render**, **Vercel**, or similar platforms:

- Do NOT commit `.env` to version control
- Set environment variables through the platform's dashboard:
  - Render: Settings → Environment → Environment Variables
  - Vercel: Settings → Environment Variables
- The application validates these at startup and will fail gracefully with a clear error message if missing

For more security details, see [SECURITY.md](SECURITY.md).

---

## ⚡ Redis Caching Architecture

Parkfinder utilizes **Redis** as a centralized, server-side caching layer to significantly reduce database load and improve response times for read-heavy operations, such as parking slot searches and dashboard queries.

### 1. Redis Setup Instructions

**Prerequisites:**
You need a running Redis instance.
- **Local:** Install Redis via Homebrew (`brew install redis`), Docker (`docker run -d -p 6379:6379 redis`), or download the Windows port.
- **Cloud:** Use a managed Redis service like Upstash or Redis Enterprise.

**Environment Variable:**
Add your Redis connection string to the `.env` file in the `server/` directory:
```env
REDIS_URL=redis://localhost:6379
```

### 2. Cache Architecture & Key Generation Strategy

- **Middleware Approach:** Caching is implemented as an Express middleware (`server/utils/cache.js`) that intercepts requests. If a cache hit occurs, it responds immediately; otherwise, it passes the request to the database and caches the outgoing response.
- **Key Generation:** Cache keys are generated deterministically using the requested URL path and query parameters.
  *Example Key:* `cache:/api/slots?location=Downtown&isEV=true`

### 3. TTL (Time-To-Live) Configuration

Different endpoints demand different caching strategies. The TTL is configurable per route by passing options to the middleware:
```javascript
// Caches response for 60 seconds
router.get("/", cacheMiddleware({ ttl: 60 }), getParkingSlots);
```
- **Frequent Updates:** (e.g., slot searches) use a short TTL like `60` seconds.
- **Static Data:** (e.g., general analytics) can use a longer TTL.

### 4. Cache Invalidation Workflow

To prevent serving stale data, the cache is automatically invalidated whenever a resource is mutated (created, updated, or deleted):
1. An Admin creates, updates, or deletes a parking slot.
2. The database updates the document.
3. The controller calls `clearCache()` to purge all cached results globally (matching `cache:*`).
4. The next user request fetches fresh data and repopulates the Redis cache.

### 5. Fallback Behavior

The system is designed with a **graceful fallback**. If the Redis service crashes or becomes temporarily unavailable, the middleware catches the error and silently falls back to direct database queries without affecting application availability or user experience.

### 6. Guidelines for Enabling Caching on Future Endpoints

To add caching to a new read-heavy endpoint:
1. Import `cacheMiddleware` from `../utils/cache.js`.
2. Insert it before your controller function in the route definition.
3. Define an appropriate `ttl` in seconds: `cacheMiddleware({ ttl: 120 })`.
4. Ensure any controller modifying this data calls `clearCache()` to invalidate it.

---

## 🧪 Automated Integration Testing

Parkfinder features a robust and modular automated integration testing suite built with **Vitest** and **Supertest** to validate critical backend API endpoints (such as Authentication and Bookings) ensuring reliability and preventing regressions.

### 1. Framework Setup & Configuration
- **Vitest:** The primary testing framework offering extremely fast, isolated test execution environments. Configured globally via `server/vitest.config.js`.
- **Supertest:** Simulates HTTP requests against the Express application in memory without starting the physical server port.
- **MongoDB Memory Server:** To maintain determinism and test isolation, a fresh, in-memory MongoDB instance is spun up via `server/test/setup.js`. This guarantees that tests do not mutate production or local development databases.

### 2. Test Environment Requirements
The tests run completely independently. Environment variables are statically overridden via Vitest (`NODE_ENV=test`, `JWT_SECRET`, `ADMIN_SECRET`), and Redis/Database connections are stubbed to prevent conflicts.
To run the tests, simply execute the following command in the `server` directory:
```bash
npm run test
```

### 3. Guidelines for Writing New Integration Tests
When creating tests for a new endpoint (e.g., `server/test/newFeature.integration.test.js`):
1. **Import the Server Application:**
   ```javascript
   import request from 'supertest';
   import app from '../server.js';
   ```
2. **Utilize `describe` and `it` blocks** to organize your tests by route and behavior.
3. **Seed Data in `beforeAll`:** If your endpoints require an authenticated user or specific database items, create them once in the `beforeAll` hook.
4. **Assert Appropriately:** Verify HTTP status codes (`expect(res.status).toBe(200)`), response payload structures, and success/error messages.

### 4. Best Practices for Maintaining Deterministic API Tests
- **Do not share state between tests:** Each `it` block should ideally run independently. Use `beforeEach` to reset specific state if necessary.
- **Teardown Collections:** The `setup.js` file automatically cleans up collections using `afterEach` hooks (`await collections[key].deleteMany()`) so data does not bleed across tests.
- **Isolate External Services:** Do not hit third-party APIs (e.g., payment gateways, emails). Use tools like `vi.mock()` or simply ensure the test environment bypasses real external executions.

---

## 🛡️ Zod Schema Validation Architecture

To ensure data integrity and prevent malformed payloads from reaching the controllers, Parkfinder utilizes a centralized request validation layer powered by **Zod**.

### 1. Framework Architecture
- **Middleware:** A generic validation middleware (`server/middleware/validate.js`) intercepts requests before they hit the controller.
- **Strict Verification:** The middleware parses the incoming `req.body`, `req.query`, and `req.params` against the provided Zod schema. If validation passes, the request is allowed through and properties are sanitized. If it fails, a structured HTTP 400 response is generated.
- **Separation of Concerns:** Controllers are kept clean and focused strictly on business logic rather than checking for missing parameters or malformed data types.

### 2. Schema Organization Strategy
All validation schemas are modularly organized within the `server/validators/` directory based on the specific feature:
- `auth.validator.js`: Schemas for user registration, login, and password resets.
- `booking.validator.js`: Schemas for creating, updating, and cancelling reservations.
- `slot.validator.js`: Schemas for admin slot modifications and creation.

### 3. Error Response Format
When validation fails, the API standardizes the response to an HTTP 400 Bad Request, structured as follows:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### 4. Creating & Extending Validation on Future Endpoints
To apply validation to a new route, follow these guidelines:
1. **Define a Schema:** Create a new schema in the appropriate `server/validators/*.js` file.
   ```javascript
   export const updateProfileSchema = z.object({
     body: z.object({
       name: z.string().min(2, 'Name is required').optional(),
     }),
   });
   ```
2. **Apply the Middleware:** Import `validateRequest` and your schema in the route definition.
   ```javascript
   import { validateRequest } from '../middleware/validate.js';
   import { updateProfileSchema } from '../validators/user.validator.js';

   router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), updateProfile);
   ```
3. **Use Passthrough For Agnostic Payloads:** When a schema should accept unpredictable additional properties, utilize `.passthrough()` on your Zod object.

---

Here's an overview of how the repository is structured:

```text
parkfinder/
├── .github/                    # Github workflows, templates and guidelines
│   ├── CODE_OF_CONDUCT.md
│   └── CONTRIBUTING.md
├── client/                     # Frontend client workspace
│   ├── public/                 # Static assets directory
│   ├── src/
│   │   ├── assets/             # Images and design layouts
│   │   ├── components/         # Reusable views (Navbar, Maps, Dashboard, AdminPanel)
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # Routing views (Login, Signup, Reset)
│   │   ├── App.tsx             # Main routing hub
│   │   └── main.tsx            # DOM mounting script
│   ├── package.json
│   └── tsconfig.json
├── server/                     # Backend API server workspace
│   ├── controllers/            # Controller endpoints (auth, bookings, dashboards)
│   ├── database/               # Database setup configuration
│   ├── getData/                # Feed seed routes helper
│   ├── middleware/             # Validation and security middleware
│   ├── models/                 # Mongoose schema definitions (User, Booking, Parking, Logs)
│   ├── routes/                 # REST routing paths
│   ├── utils/                  # Helper modules (email configurations)
│   ├── seed.js                 # Database seeding script
│   ├── server.js               # Application starting point
│   └── package.json
├── package.json                # Test suite configuration
└── README.md                   # Project documentation
```

---

## ☁️ Deploy on Render / Vercel

The application is structured to support easy deployment on cloud platforms:

### Frontend (Static Site / Vercel)

The `client` directory can be deployed directly to platforms like **Vercel** or **Netlify**:

1. Set the root directory to `client`.
2. Use Build Command: `npm run build`
3. Set Publish directory to `dist`.
4. Configure environment variable `VITE_API_URL` pointing to your deployed backend URL.

### Backend (Web Service / Render)

The `server` directory can be deployed as a Web Service to platforms like **Render**:

1. Set the root directory to `server`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Define environment variables (`MONGO_URI`, `PORT`, `JWT_SECRET`, etc.) in the dashboard configuration settings.

---

## 🤝 Contributing (SSOC '26)

This project is proud to be part of the **Social Summer of Code 2026 (SSoC26)**! We highly encourage contributions to improve the system's features, accessibility, and security.

1. **Fork** the Repository.
2. Create your **Feature Branch**: `git checkout -b feature/awesome-feature`
3. Commit your changes with descriptive messages: `git commit -m 'feat: add slot reservation scheduler'`
4. Push to your branch: `git push origin feature/awesome-feature`
5. Create a **Pull Request** targeting the `main` branch.

Please review our [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md) for more details.

---

## ⭐ Show Your Support

If you find this project helpful or educational, please consider giving it a **star**! ⭐ It helps the project gain more visibility and motivates contributors.

---

## 👤 Author

- **Anchal Singh** - _Full Stack Developer_
  - [GitHub](https://github.com/imanchalsing)

---

<p align="center">Made with ❤️ for modern urban parking</p>
