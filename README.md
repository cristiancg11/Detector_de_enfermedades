# AgroScan AI 🌾🔬
### Smart Andean Crop Health Diagnostic, MongoDB Atlas Persistence & JWT Authentication System
**Course:** Web-Oriented Programming (Programación Orientada a la Web)  
**Target Region:** Department of Nariño, Colombia (Andean Highlands, 1,500m – 3,200m a.s.l.)  
**Repository:** [github.com/cristiancg11/Detector_de_enfermedades](https://github.com/cristiancg11/Detector_de_enfermedades.git)  
**Branch:** `feature/mvp-andina-scan`  
**Frontend URL:** `http://localhost:5180` | **Backend API:** `http://localhost:8000`

---

## 1. Project Overview

**AgroScan AI** is an intelligent phytosanitary diagnostic and parcel management platform engineered for smallholder farmers and agricultural extensionists in Nariño, Colombia:
- **Potato (*Solanum tuberosum*)**: *Pastusa Suprema*, *Diacol Capiro*, *Tuquerreña* (plateaus of Túquerres, Ipiales, and Pasto).
- **Coffee (*Coffea arabica*)**: *Castillo Nariño*, *Caturra*, *Colombia* (mountain slopes of Sandoná, Consacá, and La Unión).
- **Corn (*Zea mays*)**: *Regional Amarillo*, *Choclo* (Guáitara river canyons and intermediate valleys).
- **Tomato (*Solanum lycopersicum*)**: *Chonto*, *Santa Cruz* (greenhouses and valleys of Buesaco and Chachagüí).

The system integrates client-side image processing via **Web Workers** (`OffscreenCanvas`), a **FastAPI** backend with **Google Gemini 2.5 Flash Vision** structured outputs (`Pydantic`), **MongoDB Atlas** persistence via **Motor** (`AsyncIOMotorClient`), **JWT Authentication** (`HS256`, `passlib[bcrypt]`), and an ultra-modern **Bento Grid Dashboard with Glassmorphism**.

---

## 2. Updated System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AgroScan AI Frontend                          │
│         (React 18 + TypeScript + Vite + Modern Bento Grid Theme)       │
│        • Bento Grid Dashboard: Metrics, Scanning Zone & Results        │
│        • AuthModal (Farmer Registration & One-Click Demo Access)       │
│        • CropScanner (OffscreenCanvas background thread worker)         │
│        • DiagnosticCard (Animated confidence gauge & Split-Screen view)│
│        • PlotHistoryDrawer (MongoDB Atlas sync & local cache backup)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Optimized Multipart FormData + Authorization: Bearer <token>
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Service                         │
│                           (Python 3.11+)                               │
│        • Auth Module: passlib[bcrypt] + PyJWT (HS256)                  │
│        • Auth Endpoints: POST /register | POST /login | GET /me        │
│        • Diagnostic Endpoints: POST /diagnose | GET /history           │
│        • Dynamic CORS Middleware with regex for all localhost ports   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
 Multimodal Vision │                                 │ Async Motor I/O
 System Prompt     │                                 │ (TLS certifi)
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│    Google Gemini 2.5 Flash Vision    │  │        MongoDB Atlas         │
│   (Official google-genai SDK)        │  │     (Motor Async Client)     │
│  • Pydantic structured JSON output   │  │  • 'users' collection        │
│  • Andean phytosanitary expertise    │  │  • 'diagnostics' collection  │
│  • Organic vs. Chemical pathways     │  │  • Indexed by user & lot     │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 3. Key Technical Highlights

### 🍱 Ultra-Modern Bento Grid & Glassmorphism Dashboard
- **Deep Obsidian Night Theme** (`bg-slate-950`, `bg-slate-900/80`): Rich, sleek dark theme with frosted translucent borders (`border-white/10`) and radial blur ambient backdrops.
- **Bento Grid Metric Tiles**:
  - **Total Scans Completed**: Monitored count synced with MongoDB Atlas.
  - **Critical Plots Alert**: Real-time counter of high-severity fungal/bacterial outbreaks.
  - **Monitored Lots**: Categorized parcel count indexed by plot identifier.
  - **Off-Thread Engine**: Real-time telemetry on Web Worker downscaling performance.
- **Animated Confidence Gauge**: SVG circular gauge showing probability score with color progression (emerald / amber / crimson).
- **Interactive Split-Screen Comparator**: Side-by-side or tabbed evaluation of organic biocontrols vs. active synthetic chemicals with dosage instructions and safety intervals.

### 🍃 MongoDB Atlas Persistence (Motor + certifi)
- Non-blocking asynchronous database connectivity via `motor.motor_asyncio.AsyncIOMotorClient`.
- Automated TLS certificate verification via `certifi.where()` for cloud clusters.
- Persistent collections:
  - **`users`**: Farmer accounts, hashed passwords, roles, farm names, and municipalities.
  - **`diagnostics`**: Complete phytosanitary reports linked to the authenticated `user_id` and indexed by `plot_identifier`.
- Automatic index initialization (`init_db`) on application startup.

### 🔐 Secure JWT Authentication & Farmer Management
- **Password Security**: Bcrypt salted hashing via `passlib.context.CryptContext`.
- **JWT Issuance**: Signed tokens using `HS256` algorithm with 7-day expiration.
- **Farmer Profile Metadata**:
  - Full Name
  - Farm / Parcel Name (e.g., *Finca Bella Vista*)
  - Nariño Municipality (*Túquerres*, *Pasto*, *Ipiales*, *Sandoná*, *La Unión*, *Buesaco*, *Consacá*, *Chachagüí*)
  - Agronomic Role (*Smallholder Farmer*, *Agronomist / Extensionist*, *Cooperative Producer*, *Agricultural Researcher*)
- **Demo Identity Fast-Track**: Pre-configured evaluator profiles for instant evaluation:
  - **Don Carlos Guancha** (`carlos@agroscan.co` / `narino2026`) — *Finca Bella Vista, Túquerres*
  - **Dra. Elena Bastidas** (`elena@agrosavia.co` / `narino2026`) — *Centro Obonuco AGROSAVIA, Pasto*
  - **Doña Mariana Jojoa** (`mariana.jojoa@cafesandona.org`) — *Cafetal El Mirador, Sandoná*

### ⚡ Background Web Worker Image Optimization
- Large 12MP–48MP mobile photos are processed off the main UI thread in [frontend/src/workers/imageProcessor.worker.ts](frontend/src/workers/imageProcessor.worker.ts).
- `OffscreenCanvas` resizes the image down to `1024x1024` max bounding box and compresses to JPEG `0.85` quality.
- Displays real-time worker metrics: dimension reduction, KB savings (85–95% compression), and execution time (ms).

### 💬 Interactive Agronomic Follow-up Chat Assistant (Gemini 2.5 Flash)
- **Grounded Technical Consultation**: Farmers can ask follow-up questions immediately after receiving a diagnostic report.
- **Andean Field Realities**:
  - **Backpack Sprayer Dosages**: Exact chemical/organic volume calibration for standard 20-Liter agricultural backpack sprayers (*bomba de espalda de 20L*).
  - **Rainfastness & Weather Windows**: Minimum drying hours required before mountain precipitation and fog condensation.
  - **Safety & PPE**: Personal protective equipment guidelines and pre-harvest intervals (*días de carencia*).
  - **Organic vs. Chemical Timing**: Safe application windows during crop flowering (*anthesis*) and avoiding scorch on blossom petals.
- **Dynamic Quick-Tap Chips**: Every response returns 2–3 structured suggested follow-up questions for 1-click mobile tap queries.
- **MongoDB Atlas Thread Persistence**: Messages are stored in the diagnostic document's `chat_thread` array and cached locally in `AgronomicChatThread`.

---

## 4. Local Execution & Step-by-Step Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)
- **MongoDB Atlas Connection URI**: From [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

### Step 4.1: Backend Configuration & Execution (FastAPI)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create/edit your `backend/.env` file with your credentials:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # MongoDB Atlas Connection URI
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=AgroScan
   MONGODB_DB_NAME=agroscan_db

   # JWT Security
   SECRET_KEY=agroscan-secure-jwt-key-andean-highlands-2026

   # Server Configuration
   PORT=8000
   HOST=0.0.0.0

   # Allowed CORS Origins (comma-separated)
   CORS_ORIGINS=http://localhost:5180,http://localhost:5173,http://127.0.0.1:5180,http://127.0.0.1:5173,http://localhost:3000
   ```

3. Activate virtual environment:
   ```powershell
   ..\.venv\Scripts\Activate.ps1
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Available at `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).*

---

### Step 4.2: Frontend Configuration & Execution (Vite + React)

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install packages:
   ```bash
   npm install
   ```

3. Start development server on port **5180**:
   ```bash
   npm run dev -- --host
   ```

4. Open your browser at:
   👉 **`http://localhost:5180`**

---

## 5. API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new farmer account and obtain JWT token | No |
| `POST` | `/api/v1/auth/login` | Authenticate farmer with credentials and receive JWT | No |
| `GET` | `/api/v1/auth/me` | Fetch active farmer profile details | **Yes** (Bearer JWT) |
| `POST` | `/api/v1/diagnose` | Analyze crop image via Gemini 2.5 Flash and persist in Atlas | Optional (Bearer JWT) |
| `POST` | `/api/v1/diagnose/{diagnostic_id}/chat` | Contextual agronomic follow-up consultation with Gemini 2.5 Flash | Optional (Bearer JWT) |
| `GET` | `/api/v1/history` | Query diagnostic history from MongoDB Atlas filtered by plot | Optional (Bearer JWT) |
| `GET` | `/api/v1/health` | System health check (Gemini API & MongoDB connectivity) | No |
| `GET` | `/` | Root info endpoint | No |

---

## 6. Git Commit Log

```text
* 7ba6ce5 feat(ui): redesign dashboard with modern bento grid and integrate authentication modals
* a87ed74 feat(backend): integrate MongoDB Atlas with Motor and implement JWT authentication system
* 8dc14b3 feat(ui): revamp crop scanner, diagnostic view, and plot history with cyber-agronomic theme
* cd03583 feat(auth-ui): add farmer authentication and onboarding modal
* 0de43eb style(ui): redesign aesthetic with bioluminescent cyber-flora and obsidian glassmorphism
* 894dc68 feat(auth): implement client session manager and authentication service
* ea27b79 feat(backend): add farmer registration and authentication endpoints
* 04c79e8 docs(readme): provide comprehensive deployment and local execution guidelines
* 7d78d12 feat(ui): build agronomic scanner, diagnostic split-view, and plot history drawer
* 9c7d4cd feat(frontend): add OffscreenCanvas Web Worker and OOP domain models for crop analysis
* 0eb0461 feat(backend): implement FastAPI service with Gemini 2.5 Flash vision and structured output
* 5b27e3d chore(infra): scaffold fullstack project structure and dependency configurations
```

---

## 7. License & Academic Attribution
Developed for the **Web-Oriented Programming** course.  
Released under the MIT License for educational and extension purposes in Nariño, Colombia.
