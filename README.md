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

## 🚀 Getting Started

### 1. Start the Dev Servers

Run both the API (`localhost:3001`) and Frontend (`localhost:5173`) with:
```bash
npm run dev
```

### 2. Connect Your Firebase Project in the UI

1. Open your browser at **http://localhost:5173**.
2. Click the **"Upload Service Account"** button on the home screen or the status pill in the top navigation.
3. Drag and drop your downloaded `service_account.json` or paste its JSON content directly.
4. The app will validate the keys and connect instantly!

> [!NOTE]
> Uploaded credentials are securely stored locally on your server at `api/service-account.json` (strictly ignored by `.gitignore` so your private keys are never committed).

---

### 2. Run the Application

Start both the backend API (`localhost:3001`) and frontend web app (`localhost:5173`) with a single command:

```bash
npm run dev
```

Or run them individually if preferred:
```bash
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev:web
```

Open your browser at **http://localhost:5173**.

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
