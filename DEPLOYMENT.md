# UmrahOps Deployment Pivot: Render (Split Hosting)

This guidance supersedes previous Vercel instructions. We are switching to **Render** to support a persistent Node.js backend and a decoupled static frontend.

---

## 🏗️ Architecture: Split Deployment

We are splitting the application into two discrete services:

1.  **Frontend (Static Site)**: Served via CDN/Nginx. Built to `dist/public`.
2.  **Backend (Web Service)**: Persistent Node.js/Express server. Built to `dist/server/index.js`.

---

## 1. Build Verification (Local)

Before deploying, verify the new split build process locally:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Build Both Artifacts**:
    ```bash
    npm run build
    ```
    *   Verify `dist/public/index.html` exists.
    *   Verify `dist/server/index.js` exists.
3.  **Test Backend Startup**:
    ```bash
    npm run start:prod
    ```
    *   Server should start on port 5000.

---

## 2. Deploy Client (Render Static Site)

1.  Create a **Static Site** on Render.
2.  **Repo**: `gravemont-technologies/umrahops`
3.  **Build Command**: `npm install && npm run build:client`
4.  **Publish Directory**: `dist/public`
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The URL of your deployed Backend (e.g., `https://umrahops-api.onrender.com`).
    *   `VITE_SUPABASE_URL`: Your Supabase URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

---

## 3. Deploy Server (Render Web Service)

1.  Create a **Web Service** on Render.
2.  **Repo**: `gravemont-technologies/umrahops`
3.  **Runtime**: Node
4.  **Build Command**: `npm install && npm run build:server`
5.  **Start Command**: `npm run start:prod`
6.  **Environment Variables**:
    *   `CLIENT_ORIGIN`: The URL of your deployed Frontend (e.g., `https://umrahops.onrender.com`).
    *   `DATABASE_URL`: Connection string for PostgreSQL (Supabase).
    *   `OPENAI_API_KEY`: Your OpenAI Key.
    *   `NODE_ENV`: `production`

---

## 4. Connectivity & CORS

*   **Frontend**: The client automatically prepends `VITE_API_BASE_URL` to all `/api/...` requests via a refined fetch interceptor.
*   **Backend**: The server is configured with `cors` to accept requests from `CLIENT_ORIGIN`.

---

## 5. Troubleshooting

*   **CORS Errors**: Ensure `CLIENT_ORIGIN` on the Backend matches the Frontend URL exactly (https, no trailing slash).
*   **404 on API**: Check `VITE_API_BASE_URL` on the Frontend.
*   **Database**: Ensure `DATABASE_URL` is correct and the database is accessible from Render.

**Last Updated**: 2026-02-04
**Strategy**: Split Hosting (Render Static + Render Web Service)
