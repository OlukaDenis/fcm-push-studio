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
- **Dynamic Service Account Loading & Git Safety**:
  - Reads `service-account.json` from the `api/` directory or project root.
  - `service-account.json` is strictly ignored in `.gitignore`.
  - UI includes a live status pill and **"Reload"** button to detect credentials without restarting the server.
- **Modern UI**:
  - Dark and Light mode support with automatic system preference detection and localStorage persistence.

---

## 🚀 Getting Started

### 1. Place Your Firebase Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/) -> **Project Settings** -> **Service accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Save or rename the file to:
   ```text
   api/service-account.json
   ```
   *(A reference template is available at `api/service-account.example.json`)*.

> [!NOTE]
> `service-account.json` is added to `.gitignore` so your private credentials will never be committed to Git.

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
