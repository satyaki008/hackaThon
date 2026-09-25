# ResiStore Frontend (Vercel Ready)

This is the standalone React + Vite + Tailwind CSS dashboard for **ResiStore: Enterprise Self-Healing Distributed Object Storage System**.

## 🚀 One-Click Deploy to Vercel

### Step 1: Push to GitHub
Commit and push this repository to your GitHub account.

### Step 2: Import into Vercel
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. In the **Project Configuration** screen:
   - **Framework Preset**: `Vite` (Vercel will auto-detect this)
   - **Root Directory**: `frontend` *(Click Edit and select `frontend` if using a monorepo, or leave as `./` if frontend is its own repo)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Configure Backend Environment Variable
Under **Environment Variables**, add:
- **Key**: `VITE_API_URL`
- **Value**: `https://<your-render-backend-name>.onrender.com` *(Your Render backend URL without trailing slash)*

Click **Deploy**! 🚀

Within 30 seconds, your site will be live at `https://your-project.vercel.app`.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Vite Dev Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.
In local development, requests to `/api` are automatically proxied to `http://127.0.0.1:8000` via `vite.config.js`.

### 3. Build for Production
```bash
npm run build
```
Build output is saved to `dist/`.
