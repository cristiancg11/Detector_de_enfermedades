# AgroScan AI 🌾🔬
### Smart Andean Crop Health Diagnostic & Farmer Authentication System
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

The system integrates client-side image processing via **Web Workers** (`OffscreenCanvas`), a **FastAPI** backend with **Google Gemini 2.5 Flash Vision** structured outputs (`Pydantic`), **Farmer Authentication & Account Creation**, and an **Obsidian & Bioluminescent Flora Design System** with parcel-indexed persistence in `localStorage`.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AgroScan AI Frontend                          │
│         (React 18 + TypeScript + Vite + Cyber-Agronomic Tailwind)      │
│        • AuthModal (Farmer Registration & One-Click Demo Access)       │
│        • CropScanner (OffscreenCanvas background thread worker)         │
│        • DiagnosticCard (Confidence meter & Organic vs Chemical view)  │
│        • PlotHistoryDrawer (Persistent lot indexing & search filter)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Optimized Multipart FormData Payload + JWT Bearer
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Service                         │
│                           (Python 3.11+)                               │
│        • Auth Endpoints: /api/v1/auth/register | /api/v1/auth/login    │
│        • Diagnostic Endpoints: POST /api/v1/diagnose | GET /history   │
│        • Dynamic CORS Middleware with regex for all localhost ports   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Multimodal Vision + Andean System Prompt
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Google Gemini 2.5 Flash Vision                      │
│                  (Official google-genai Python SDK)                    │
│        • response_schema=DiagnosticResponse (Strict Deterministic JSON)│
│        • Andean agronomy: Late Blight, Coffee Rust, Armyworm, Blight   │
│        • Comparative pathways: Organic bio-inputs vs. Active chemicals │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Technical Highlights

### 🎨 Cyber-Agronomic Visual Design System
- **Obsidian Night Foundation** (`#030712`, `#070f1e`): Eliminates generic flat color palettes with depth and subtle radial mesh gradients.
- **Bioluminescent Andean Flora** (`#00f59b`, `#10e281`): High-visibility glowing accents inspired by mountain flora chlorophyll fluorescence.
- **Electric Cyan Plasma** (`#00f0ff`): High-tech diagnostic indicators for AI vision analysis.
- **Solar Highland Amber** (`#ffb703`): Warning highlights for moderate infestations and harvest safety warnings.
- **Glassmorphism Panels**: Frosted backdrop blur (`backdrop-blur-2xl`) with multi-color glowing borders.

### 🔐 Farmer Authentication & Profile Management
- Secure user registration and login endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`).
- Farmer profiles store agricultural metadata:
  - **Full Name**
  - **Farm / Lot Name** (e.g. *Finca Bella Vista*)
  - **Municipality in Nariño** (*Túquerres*, *Pasto*, *Ipiales*, *Sandoná*, *La Unión*, *Buesaco*, *Consacá*, *Chachagüí*)
  - **Agronomic Role** (*Smallholder Farmer*, *Agronomist / Extensionist*, *Cooperative Producer*, *Agricultural Researcher*)
- **One-Click Demo Field Accounts**: Pre-configured profiles for immediate evaluator access without manual typing:
  - **Don Carlos Guancha** (`carlos@agroscan.co` / `narino2026`) — *Finca Bella Vista, Túquerres*
  - **Dra. Elena Bastidas** (`elena@agrosavia.co` / `narino2026`) — *Centro Obonuco AGROSAVIA, Pasto*

### ⚡ Background Web Worker Image Downscaling
- Large 12MP–48MP mobile photos are processed off the main UI thread in [frontend/src/workers/imageProcessor.worker.ts](frontend/src/workers/imageProcessor.worker.ts).
- `OffscreenCanvas` resizes the image down to `1024x1024` max bounding box and compresses to JPEG `0.85` quality.
- Slashes transfer payloads by 85–95% while keeping the browser thread responsive with 60 FPS fluidity.

### 🏛️ Object-Oriented Domain Layer (OOP)
- **`AuthSessionManager`**: Coordinates authentication persistence, tokens, and active farmer identities.
- **`CropDiagnosticRequest`**: Encapsulates crop parameters, validations, and `FormData` generation.
- **`DiagnosticReport`**: Encapsulates AI findings, confidence formatting, and visual severity styling.
- **`FarmPlotHistoryManager`**: Coordinates parcel logs in `localStorage`, grouping by plot and supporting JSON backups.

---

## 4. Local Execution & Step-by-Step Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### Step 4.1: Backend (FastAPI)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Available at `http://localhost:8000` (Docs at `http://localhost:8000/docs`).*

---

### Step 4.2: Frontend (Vite + React)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start development server on clean port **5180**:
   ```bash
   npm run dev -- --host
   ```
4. Open your browser at:
   👉 **`http://localhost:5180`**

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Create a new farmer account |
| `POST` | `/api/v1/auth/login` | Authenticate farmer and receive access token |
| `GET` | `/api/v1/auth/me` | Fetch active farmer profile |
| `POST` | `/api/v1/diagnose` | Submit crop image for Gemini 2.5 Flash analysis |
| `GET` | `/api/v1/history` | Retrieve past diagnostic sessions |
| `GET` | `/api/v1/health` | Service health check (`gemini-2.5-flash`) |

---

## 6. Git Commit Log

```text
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
Developed for the **50% MVP Milestone** of the **Web-Oriented Programming** course.  
Released under the MIT License for educational and extension purposes in Nariño, Colombia.
