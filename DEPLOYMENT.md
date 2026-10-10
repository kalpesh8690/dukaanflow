# Deploy DukaanFlow (initial setup)

This guide prepares the project for a free-tier test deployment. Free hosting may sleep or have usage limits, so it is suitable for a prototype, not a production uptime guarantee.

## 1. Create MongoDB Atlas database

1. Create a MongoDB Atlas account and a free shared cluster if available in your region.
2. Create a dedicated database user with a strong unique password; do not use your Atlas account password.
3. In Network Access, allow the deployed API to reach the cluster. For a prototype on hosting without stable outbound IPs, you may need a broader IP rule; use this only with a strong database password and least-privilege database user, and tighten access when possible.
4. Copy the Atlas connection string and replace the username, password, and database name. Keep it private.

## 2. Deploy the API on Render

1. Push this repository to GitHub (already done).
2. In Render, create a new Blueprint and connect `kalpesh8690/dukaanflow`, or create a Web Service manually.
3. For manual setup use root directory `backend`, build command `npm install`, start command `npm start`, and health check path `/api/health`.
4. Set `MONGODB_URI` to your Atlas connection string, `JWT_SECRET` to a generated random secret of at least 32 characters, `JWT_EXPIRES_IN` to `1d`, and `CORS_ORIGIN` to your allowed web origin if you later add a web client. Native Android requests are not governed by browser CORS, but never expose secrets in the mobile app.
5. Wait for deployment, then open `https://YOUR-SERVICE.onrender.com/api/health`. Expect `{"status":"ok","service":"dukaanflow-api"}`.

Do not commit real `.env` files, database URIs, or JWT secrets.

## 3. Connect the Expo app

Set `EXPO_PUBLIC_API_URL` to `https://YOUR-SERVICE.onrender.com/api` in the Expo environment used for the build. This value is public and must contain no secrets. `EXPO_PUBLIC_API_URL` is compiled into the app, so rebuild after changing it.

For an Android phone on the same Wi-Fi as a locally running backend, use your computer's LAN IP instead of `localhost`, for example `http://192.168.1.20:4000/api`, and allow the port through your computer firewall. On a physical phone, `localhost` refers to the phone itself.

## 4. Build an Android APK with EAS

From `mobile/`, install dependencies and log in to Expo on a computer or compatible cloud development environment, then run `npx eas-cli build --platform android --profile preview`. The `preview` profile is configured for an APK. EAS may require an Expo account and build quota. Download the APK from the build page and install it on your test device.

## Before production

- Add automated integration tests for registration, login, expiry, and cross-business data isolation.
- Add pagination and request validation limits, audit security dependencies, and review rate limits.
- Set up database backups, monitoring, logging without passwords/tokens, and an incident recovery plan.
- Test on physical Android devices and verify all auth and product flows before accepting real customer data.
