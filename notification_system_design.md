# Campus Notifications System Design

## Architecture

The project is a plain React application built with JavaScript, HTML, and CSS. It uses a small modular structure:


- `logging_middleware/` contains a reusable copy of the frontend logger for evaluation.
- `notification_app_fe/` contains the complete React frontend application.
- `notification_app_be/` is present for the required submission structure; this frontend submission uses the provided evaluation backend.
- `notification_app_fe/src/components/` contains reusable UI pieces such as the top bar, filters, notification cards, priority inbox, modal, diagnostics panel, and error boundary.
- `notification_app_fe/src/pages/` contains page-level flows for setup/authentication and the dashboard.
- `notification_app_fe/src/services/` contains API integration for registration, authentication, and notifications.
- `notification_app_fe/src/middleware/` contains the reusable logging middleware used by the app.
- `notification_app_fe/src/context/` contains the authentication context and token refresh behavior.
- `notification_app_fe/src/utils/` contains storage, validation, formatting, and priority scoring helpers.
- `notification_app_fe/src/styles/` contains the application stylesheet. Selectors are class-based only.

## API Integration

The app targets `http://20.207.122.201/evaluation-service`. In local development, Vite proxies `/evaluation-service` to that same remote server so the browser can call the APIs from `http://localhost:3000` reliably.

- `POST /register` registers the student details and returns `clientID` and `clientSecret`.
- `POST /auth` exchanges the registration details and client credentials for a bearer token.
- `GET /notifications` fetches protected notification data with `limit`, `page`, and optional `notification_type`.
- `POST /logs` receives frontend logs from the reusable logger.

All fetch calls go through `requestJson()` in `src/services/apiClient.js`. It handles timeouts, invalid JSON, empty responses, HTTP errors, authorization headers, and diagnostic entries.

## Auth Flow

The setup screen collects email, name, mobile number, GitHub username, roll number, and access code. The app validates these fields before any network request.

On submit:

1. The app calls `/register`.
2. Returned `clientID` and `clientSecret` are stored in `localStorage`.
3. The app calls `/auth`.
4. The access token and computed expiry timestamp are stored.
5. The dashboard opens only after authentication succeeds.

If the token is missing or expired, `AuthProvider` attempts automatic re-authentication using the saved profile and saved client credentials. If registration already exists and credentials are already saved locally, the app uses the saved credentials to continue authentication.

## Priority Algorithm

Priority scoring is deterministic and implemented in `src/utils/priorityScore.js`.

The score combines:

- Type weight: `Placement` = 3000, `Result` = 2000, `Event` = 1000.
- Unread boost: unread notifications receive 5000 points.
- Recency score: newer notifications receive up to 1000 extra points across a seven-day window.

The Priority Inbox filters to unread notifications, sorts by score, uses timestamp and ID as stable tie-breakers, and displays the top 10.

## Viewed And Unread Handling

If the API does not provide read status, the frontend owns viewed state. Viewed notification IDs are persisted in `localStorage`. A notification is marked viewed when the user opens its detail modal. The dashboard updates the list and recomputes the Priority Inbox immediately.

Unread notifications have a visual accent and `New` badge. Viewed notifications use quieter styling and a `Viewed` badge.

## Logging Middleware

`notification_app_fe/src/middleware/logger.js` and `logging_middleware/logger.js` export:

```js
log(stack, level, packageName, message)
```

They validate lowercase `stack`, `level`, and `package` values, post to the protected `/logs` endpoint, attach the saved bearer token when available, and record local diagnostics. Logging is intentionally non-blocking for app behavior: network, missing-token, or server failures are swallowed safely.

The app logs startup, registration, authentication, fetch success/failure, filter changes, pagination, notification views, validation failures, and unexpected React errors.

## Error Handling Strategy

The app protects against:

- Network failures and timeouts.
- Invalid JSON and empty server responses.
- Bad credentials, expired tokens, and unauthorized notification requests.
- Duplicate registration when saved credentials are available.
- Unexpected notification payload shapes.
- React render failures through a global error boundary.

User-facing errors are concise and actionable. Technical details stay in diagnostics and logs.

## Assumptions

- The evaluation API may return notification arrays directly or under keys such as `notifications`, `data`, `results`, or `items`.
- Notification fields may use common variants such as `id`, `_id`, `notification_id`, `type`, `notification_type`, `createdAt`, or `created_at`.
- `/logs` is treated as a protected route per the evaluation screenshots. Pre-auth startup logs may fail quietly until a bearer token exists.
- Registration can only happen once, so saved client credentials are required for automatic recovery after duplicate registration.
