# Campus Notifications Platform

A plain React campus notifications app for the evaluation service.

## Run locally

```bash
cd notification_app_fe
npm install
npm run dev
```

The frontend is configured to run on the required evaluation URL:

```text
http://localhost:3000/
```

During local development, API calls are proxied through Vite from
`/evaluation-service` to `http://20.207.122.201/evaluation-service`.
This avoids browser CORS/network differences while preserving the same
evaluation API.

## Build

```bash
cd notification_app_fe
npm run build
```

The app integrates with `http://20.207.122.201/evaluation-service`, supports registration, authentication, notification filtering, load-more pagination, priority inbox scoring, persisted viewed state, and reusable frontend logging middleware.
