# Logging Middleware

Reusable frontend logging middleware for the Campus Notifications app.

The exported `log(stack, level, packageName, message)` function sends lower-case log payloads to the protected log API:

```text
http://20.207.122.201/evaluation-service/logs
```

The middleware attaches the saved bearer token from `localStorage` when available. Logging failures are swallowed so application workflows never break because the logging endpoint is unavailable.
