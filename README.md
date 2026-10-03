# 🔔 FCM Push Testing Platform

A full-stack developer studio to dispatch, test, simulate, and inspect **Firebase Cloud Messaging (FCM v1)** push notifications to **Single Devices**, **Topics**, and **General Broadcasts (`all`)**.

Built with **NestJS (TypeScript)**, **React (Vite + Tailwind CSS)**, and **SQLite (TypeORM)**, adhering to **SOLID** and **DRY** principles.

---

## ✨ Features

- **Multi-Target Push Dispatching**:
  - **Single Device**: Direct target using an FCM device registration token.
  - **Topic**: Target specific topic groups (e.g. `news`, `alerts`).
  - **General Broadcast**: Target broadcast subscribers (defaults to the `'all'` topic).
- **Interactive Live Simulator**:
  - Dual preview mockup: toggle between **iOS Lock Screen Banner** and **Android Notification Shade**.
  - Updates in real-time as you type title, body, and image URL.
- **Custom Key-Value Data Builder**:
  - Add dynamic key-value string pairs to notifications (e.g., `click_action`, `route`, `item_id`).
- **Advanced Platform Overrides**:
  - **Android**: Custom channel ID, priority (`high` or `normal`).
  - **iOS (APNs)**: Badge counter, sound selector.
- **Topic Subscription Manager**:
  - Utility to quickly subscribe or unsubscribe one or multiple device tokens to/from any topic with immediate status counts.
- **Persistent SQLite History**:
  - Every dispatch (success or failure) is logged in SQLite (`fcm_testing.sqlite`).
  - Searchable by target, title, and message ID.
  - One-click **"Clone to Studio"** to restore previous payloads directly into the editor for rapid iteration.
  - Full inspection modal showing raw JSON payload and FCM responses/error codes.
- **Dynamic Service Account Upload & Management**:
  - Upload `service_account.json` via drag-and-drop or paste raw JSON directly in the UI.
  - Dynamically initializes and switches Firebase projects at runtime without restarting servers.
  - Active project status card showing Project ID, Client Email, and Disconnect / Replace actions.
  - Also detects existing local `service-account.json` files if provided on disk.
- **Modern UI**:
  - Dark and Light mode support with automatic system preference detection and localStorage persistence.

---

## 🚀 Getting Started (Development)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run the Development Servers
Start both the backend API (`localhost:3001`) and frontend web app (`localhost:5173`) with a single command:

```bash
npm run dev
```

Or run them individually if preferred:
```bash
# Terminal 1: Backend (NestJS)
npm run dev:api

# Terminal 2: Frontend (Vite + React)
npm run dev:web
```

### 3. Connect Your Firebase Project in the UI

1. Open your browser at **http://localhost:5173**.
2. Click the **"Upload Service Account"** button on the home screen or the status pill in the top navigation.
3. Drag and drop your downloaded `service_account.json` or paste its JSON content directly.
4. The app will validate the keys and connect instantly!

> [!NOTE]
> Uploaded credentials are securely stored locally on your server at `api/service-account.json` (strictly ignored by `.gitignore` so your private keys are never committed).

---

## 🚢 Production Deployment with PM2

This project includes a turnkey **PM2 ecosystem configuration** ([`ecosystem.config.cjs`](file:///d:/Projects/WebProjects/fcm-push-testing/ecosystem.config.cjs)) that deploys and orchestrates both the **NestJS API** and the **Vite React Web UI** with automated restarts, log rotation, and memory management.

### Architecture in PM2
- **`fcm-push-api`**: Runs the compiled NestJS server (`api/dist/main.js`) on port `3001`. Runs in `fork` mode with single-instance execution to ensure ACID-safe SQLite database access (`api/fcm_testing.sqlite`).
- **`fcm-push-web`**: Serves the compiled Vite production bundle on port `5550` (`--host` enabled). Requests to `/api/*` are automatically reverse-proxied to the backend API without requiring extra web server setup.
- **Unified Logging**: Output and error logs are stored under the [`logs/`](file:///d:/Projects/WebProjects/fcm-push-testing/logs) directory (`logs/api-*.log`, `logs/web-*.log`).

---

### Step-by-Step Deployment

#### 1. Install PM2 Globally (if not already installed)
```bash
npm install -g pm2
```

#### 2. Install Project Dependencies
```bash
npm run install:all
```

#### 3. Build Both Applications
Compile the NestJS backend and build the optimized React bundle:
```bash
npm run build
```

#### 4. Launch with PM2
Start all services in the background using the npm script:
```bash
npm run pm2:start
```
*Or using the PM2 CLI directly:*
```bash
pm2 start ecosystem.config.cjs
```

#### 5. Verify Running Processes
Check process health and memory consumption:
```bash
npm run pm2:status
# or
pm2 status
```

Both apps should show status **`online`**:
- **Frontend Studio**: [http://localhost:5550](http://localhost:5550)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)

---

### 🛠️ PM2 Management Commands

Pre-configured npm shortcuts are provided in the root `package.json`:

| Action | NPM Shortcut | Direct PM2 Command |
|---|---|---|
| **Start all** | `npm run pm2:start` | `pm2 start ecosystem.config.cjs` |
| **Stop all** | `npm run pm2:stop` | `pm2 stop ecosystem.config.cjs` |
| **Restart all** | `npm run pm2:restart` | `pm2 restart ecosystem.config.cjs` |
| **Zero-downtime Reload** | `npm run pm2:reload` | `pm2 reload ecosystem.config.cjs` |
| **Delete from PM2** | `npm run pm2:delete` | `pm2 delete ecosystem.config.cjs` |
| **View Live Logs** | `npm run pm2:logs` | `pm2 logs` |
| **Process Status** | `npm run pm2:status` | `pm2 status` |
| **Terminal Dashboard** | `npm run pm2:monit` | `pm2 monit` |

To view logs for a specific application:
```bash
pm2 logs fcm-push-api
pm2 logs fcm-push-web
```

---

### 🔄 Auto-Start on System Reboot (Persistence)

To ensure PM2 automatically brings up the full project after a machine restart:

#### Linux / macOS:
```bash
# Generate and configure the startup script
pm2 startup

# Save the currently running process list
pm2 save
```

#### Windows:
Use [`pm2-windows-service`](https://github.com/jon-hall/pm2-windows-service) to register PM2 as a native Windows Service:
```powershell
npm install -g pm2-windows-service
pm2-service-install
pm2 save
```

---

### 🌐 Optional: Nginx Reverse Proxy Configuration

If you are hosting on a Linux VPS / cloud server behind a domain name (e.g. `fcm.yourdomain.com`), you can point Nginx to the PM2 frontend:

```nginx
server {
    listen 80;
    server_name fcm.yourdomain.com;

    # Frontend Studio (proxies API calls automatically)
    location / {
        proxy_pass http://127.0.0.1:5550;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional direct route to backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🏗️ Architecture & Best Practices

### SOLID Principles in Backend
- **Single Responsibility (SRP)**:
  - `FirebaseService`: Solely manages Firebase Admin SDK initialization, health checks, and credential discovery.
  - `PushService`: Formats FCM v1 payloads and executes messaging requests.
  - `TopicService`: Manages topic subscriptions and unsubscriptions.
  - `HistoryService`: Manages SQLite database persistence and queries.
- **Open/Closed & Dependency Inversion (OCP / DIP)**:
  - Push dispatching relies on the `INotificationProvider` abstraction and `NOTIFICATION_PROVIDER` token injected via NestJS dependency injection.
- **Interface Segregation (ISP)**:
  - Distinct DTOs and contracts for Device, Topic, and Broadcast configurations.

### Database
- Uses a local SQLite database (`api/fcm_testing.sqlite`) via TypeORM. No external database servers required.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/firebase/status` | Check if `service-account.json` is loaded and view project ID |
| `POST` | `/api/firebase/reload` | Hot-reload `service-account.json` from disk |
| `POST` | `/api/push/send` | Send push to `token`, `topic`, or `broadcast` |
| `POST` | `/api/topic/subscribe` | Subscribe token(s) to an FCM topic |
| `POST` | `/api/topic/unsubscribe` | Unsubscribe token(s) from an FCM topic |
| `GET` | `/api/history` | List notification history with pagination & filters |
| `GET` | `/api/history/:id` | Get details of a single historical notification |
| `DELETE` | `/api/history/:id` | Delete a single history item |
| `DELETE` | `/api/history` | Clear all notification history |
