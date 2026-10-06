# AgroScan AI 🌾🔬
### Smart Andean Crop Health Diagnostic Assistant (50% MVP Delivery)
**Course:** Web-Oriented Programming (Programación Orientada a la Web)  
**Target Region:** Department of Nariño, Colombia (Andean Highlands, 1,500m – 3,200m a.s.l.)  
**Repository:** [github.com/cristiancg11/Detector_de_enfermedades](https://github.com/cristiancg11/Detector_de_enfermedades.git)  
**Branch:** `feature/mvp-andina-scan`

---

## 1. Project Overview

**AgroScan AI** is an intelligent phytosanitary diagnostic assistant built specifically for smallholder farmers cultivating staple Andean crops in Nariño, Colombia:
- **Potato (*Solanum tuberosum*)**: *Pastusa Suprema*, *Diacol Capiro*, *Tuquerreña* (plateaus of Túquerres, Ipiales, and Pasto).
- **Coffee (*Coffea arabica*)**: *Castillo Nariño*, *Caturra*, *Colombia* (mountain slopes of Sandoná, Consacá, and La Unión).
- **Corn (*Zea mays*)**: *Regional Amarillo*, *Choclo* (Guáitara river canyons and intermediate valleys).
- **Tomato (*Solanum lycopersicum*)**: *Chonto*, *Santa Cruz* (greenhouses and valleys of Buesaco and Chachagüí).

The system addresses the challenge of heavy smartphone camera captures (12MP–48MP) on rural mobile connections by executing hardware-accelerated image downscaling and compression in a background thread via **Web Workers** (`OffscreenCanvas`), transmitting optimized payloads to a **FastAPI** backend integrated with **Google Gemini 2.5 Flash Vision** using **Structured Outputs** (`Pydantic` schemas), and displaying comparative treatment pathways (Organic / Biological vs. Conventional Chemical) with plot/lot persistence in `localStorage`.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AgroScan AI Frontend                          │
│               (React 18 + TypeScript + Vite + Tailwind CSS)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               User Photo (File / Camera / Demo Sample)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Background Web Worker (imageProcessor.worker.ts)           │
│        • createImageBitmap() off-main-thread                            │
│        • Hardware-accelerated OffscreenCanvas downscale (max 1024x1024) │
│        • JPEG compression (0.85 quality)                               │
│        • Real-time UI metric feedback: dimensions, KB saved, duration  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Optimized Multipart FormData Payload
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Service                         │
│                           (Python 3.11+)                               │
│        • CORS Middleware & File validation                             │
│        • POST /api/v1/diagnose  |  GET /api/v1/history                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Multimodal Vision + Andean System Prompt
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Google Gemini 2.5 Flash Vision                      │
│                  (Official google-genai Python SDK)                    │
│        • response_schema=DiagnosticResponse (Strict JSON)              │
│        • Phytosanitary classification & Andean agronomic knowledge     │
│        • Split-view: Organic bio-inputs vs. Active chemical ingredients│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               Structured Diagnostic JSON Response
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 OOP Domain Layer & Farm Plot Persistence               │
│        • CropDiagnosticRequest.ts (Payload & validation)               │
│        • DiagnosticReport.ts (Severity metrics & utility methods)      │
│        • FarmPlotHistoryManager.ts (localStorage indexed by lot)       │
│        • PlotHistoryDrawer.tsx (Slide-over history & JSON export)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Technical Highlights

### ⚡ Client-Side Web Worker Image Optimization
- Large uncompressed smartphone photos (often 5MB to 20MB) are passed via `postMessage` to `src/workers/imageProcessor.worker.ts`.
- The worker decodes the file using `createImageBitmap()` and renders it onto an `OffscreenCanvas`.
- Resizes proportionally to a bounding box of 1024×1024 pixels and exports a compressed JPEG (`quality: 0.85`), slashing payload size by 85–95% and eliminating UI freezes or frame drops on low-end mobile devices.

### 🧠 Gemini 2.5 Flash with Pydantic Structured Outputs
- Powered by the official Google GenAI SDK (`google-genai` version 2.28+).
- System prompt is deeply informed by Colombian Andean phytopathology (e.g., *Phytophthora infestans*, *Hemileia vastatrix*, *Spodoptera frugiperda*, *Alternaria solani*).
- Uses `types.GenerateContentConfig(response_mime_type="application/json", response_schema=DiagnosticResponse)` to guarantee 100% deterministic, type-safe JSON output matching the backend Pydantic model.

### 🏛️ Object-Oriented Domain Layer (OOP)
- **`CropDiagnosticRequest`**: Encapsulates crop variety, lot identifier, image blob, validates payload consistency, and manufactures `FormData`.
- **`DiagnosticReport`**: Domain entity providing formatted dates, confidence percentages, visual severity styles (`LOW`, `MODERATE`, `CRITICAL`), pathogen categories, and summary snippets.
- **`FarmPlotHistoryManager`**: Static domain manager coordinating local persistence grouped by farm lot/terrace, computing per-plot statistics, and providing JSON import/export functionality.

### 🎨 High-End Agronomic Design System
- Modern dark mode palette (`slate-950` base, `slate-900` surfaces, `emerald-500` primary accents).
- High-tech scanning overlay animation (`@keyframes scan`).
- Visual confidence gauge with dynamic color thresholds.
- Comparative split-view selector (Split View / Organic Only / Chemical Only).
- Slide-over drawer with plot filtering and history management.

---

## 4. Directory Structure

```
Detector_de_enfermedades/
├── .gitignore                          # Node, Python, env, and IDE ignore rules
├── README.md                           # Complete project documentation in English
├── backend/
│   ├── .env.example                    # Backend environment variables template
│   ├── requirements.txt                # FastAPI, google-genai, pydantic, uvicorn
│   └── app/
│       ├── __init__.py
│       ├── config.py                   # Pydantic Settings (GEMINI_API_KEY, CORS, PORT)
│       ├── schemas.py                  # Pydantic Enums and DiagnosticResponse schema
│       ├── main.py                     # FastAPI app, CORS, /diagnose and /history
│       └── services/
│           ├── __init__.py
│           └── gemini_service.py       # Gemini 2.5 Flash vision & Andean knowledge
└── frontend/
    ├── .env.example                    # Frontend environment variables template
    ├── index.html                      # HTML5 template with Google Fonts (Plus Jakarta Sans)
    ├── package.json                    # React 18, Vite, Lucide, Tailwind dependencies
    ├── postcss.config.js               # PostCSS configuration
    ├── tailwind.config.js              # Custom agronomic color palette and animations
    ├── tsconfig.json                   # TypeScript config with WebWorker and Vite types
    ├── tsconfig.node.json
    ├── vite.config.ts                  # Vite config with worker: { format: 'es' }
    └── src/
        ├── App.tsx                     # Main application layout and coordinator
        ├── index.css                   # Tailwind base directives and custom scrollbars
        ├── main.tsx                    # React DOM entry point
        ├── vite-env.d.ts               # Vite client environment type definitions
        ├── components/
        │   ├── CropScanner.tsx         # Crop selector, plot input, worker metrics, preview
        │   ├── DiagnosticCard.tsx      # Confidence gauge, badges, split-view treatments
        │   └── PlotHistoryDrawer.tsx   # Slide-over sidebar for saved plot records
        ├── models/
        │   ├── CropDiagnosticRequest.ts   # OOP Request domain model
        │   ├── DiagnosticReport.ts        # OOP Report domain model
        │   └── FarmPlotHistoryManager.ts  # Static persistence manager for plots
        ├── services/
        │   └── apiService.ts           # HTTP communication with FastAPI backend
        ├── types/
        │   └── index.ts                # Shared TypeScript types and interfaces
        └── workers/
            └── imageProcessor.worker.ts # OffscreenCanvas downscale & JPEG worker
```

---

## 5. Local Setup and Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.11 or higher
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/).

---

### Step 5.1: Backend Configuration & Launch

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create the `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and supply your Gemini API key:
   ```ini
   GEMINI_API_KEY=AIzaSy...YourKeyHere
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The backend will be available at:
   - **API Base URL:** `http://localhost:8000`
   - **Interactive Swagger Docs:** `http://localhost:8000/docs`
   - **Health Check Endpoint:** `http://localhost:8000/api/v1/health`

---

### Step 5.2: Frontend Configuration & Launch

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ensure the API URL points to your running backend:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 6. How to Test the Application

1. **Select an Andean Crop**: Choose between Potato 🥔, Coffee ☕, Corn 🌽, or Tomato 🍅.
2. **Assign a Farm Plot**: Enter a lot name (e.g. `Plot A - North Furrow`) or click one of the preset chips.
3. **Provide a Leaf Photo**:
   - Drag and drop an image from your computer.
   - Click to browse or capture via device camera.
   - **Quick Demo Samples**: Click any of the sample buttons in the top right header (`🥔 Potato`, `☕ Coffee`, `🌽 Corn`, `🍅 Tomato`) to generate an instant Andean foliar sample.
4. **Observe the Web Worker**:
   - Notice the real-time indicator: *"Optimizing photo on background thread..."*
   - Review the metrics pill showing initial resolution, downscaled size, percentage saved, and execution time in milliseconds.
5. **Run the Diagnostic**:
   - Click **"Analyze Plant Health with Gemini 2.5 Flash"**.
   - Review the generated **AI Confidence Gauge**, **Severity Badge**, **Phenotypic Symptoms**, and the **Split-View Treatment Matrix** (Organic vs. Chemical).
6. **Inspect Plot History**:
   - Click **"Plot History"** in the top navigation bar to open the slide-over drawer.
   - Filter analyses by lot, inspect past records, or click **"Export JSON"** to download persistent logs.

---

## 7. Git Commit Workflow

The repository follows atomic conventional commits organized by architectural layer:

1. `chore(infra): scaffold fullstack project structure and dependency configurations`
2. `feat(backend): implement FastAPI service with Gemini 2.5 Flash vision and structured output`
3. `feat(frontend): add OffscreenCanvas Web Worker and OOP domain models for crop analysis`
4. `feat(ui): build agronomic scanner, diagnostic split-view, and plot history drawer`
5. `docs(readme): provide comprehensive deployment and local execution guidelines`

---

## 8. Academic Authorship & License

Developed for the **50% MVP Milestone** of the **Web-Oriented Programming** course.  
All source code, schemas, and UI elements are released under the MIT License for educational and extension purposes in the Department of Nariño, Colombia.
