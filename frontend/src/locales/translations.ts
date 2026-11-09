/**
 * AgroScan AI - Bilingual Dictionary (English & Spanish).
 *
 * Provides typed translation tokens for authentication, dashboard analytics,
 * phytosanitary diagnostics, agronomic treatments, and backpack sprayer dosage calculations.
 */

export type SupportedLanguage = 'en' | 'es';

export interface TranslationDictionary {
  // Navigation & Controls
  langName: string;
  themeToggle: string;
  themeLight: string;
  themeDark: string;
  brandTagline: string;
  andeanHighlands: string;
  systemStatusSynced: string;
  systemStatusLive: string;
  farmPlotsHistory: string;
  switchAccount: string;
  logOut: string;

  // Auth Gate
  signInTitle: string;
  registerFarmTitle: string;
  authSubtitleSignIn: string;
  authSubtitleRegister: string;
  protectedRouteBadge: string;
  tabSignIn: string;
  tabRegisterFarm: string;
  fieldFullName: string;
  placeholderFullName: string;
  fieldFarmName: string;
  placeholderFarmName: string;
  fieldEmail: string;
  placeholderEmail: string;
  fieldPassword: string;
  placeholderPasswordLogin: string;
  placeholderPasswordRegister: string;
  btnEnterDashboard: string;
  btnRegisterFarm: string;
  btnAuthenticating: string;
  jwtSecurityNotice: string;
  authAlertTitle: string;
  heroHeadline: string;
  heroDescription: string;
  heroBadge: string;
  heroTrustNotice: string;
  heroLocation: string;

  // Feature Pills in Hero
  pillGeminiVision: string;
  pillDosageEngine: string;
  pillWeatherRisk: string;

  // Dashboard Metrics & Headers
  dashboardActiveParcel: string;
  dashboardFarmer: string;
  dashboardRole: string;
  metricFoliarCoverage: string;
  metricCoverageStatus: string;
  metricAlertsActive: string;
  metricAlertsOutbreak: string;
  metricAlertsZero: string;
  metricMonitoredLots: string;
  metricParcelsMapped: string;
  metricPlotIdentifier: string;
  metricOffThreadEngine: string;
  metricZeroUILockup: string;

  // Crop Scanner
  scannerCropType: string;
  scannerCropSubtitle: string;
  scannerPlotName: string;
  scannerPlotPlaceholder: string;
  scannerUploadTitle: string;
  scannerUploadPrompt: string;
  scannerDropActive: string;
  scannerReplacePhoto: string;
  scannerWorkerRunning: string;
  scannerWorkerDone: string;
  scannerSpeed: string;
  scannerRunBtn: string;
  scannerAnalyzingBtn: string;
  scannerDownscalingBtn: string;

  // Andean Crops
  cropPotato: string;
  cropPotatoVariety: string;
  cropCoffee: string;
  cropCoffeeVariety: string;
  cropCorn: string;
  cropCornVariety: string;
  cropTomato: string;
  cropTomatoVariety: string;

  // Diagnostic Report
  diagnosticReportTitle: string;
  diagnosticReadyTitle: string;
  diagnosticReadyDesc: string;
  diagnosticConfidence: string;
  diagnosticSeverity: string;
  diagnosticScientificName: string;
  diagnosticSymptoms: string;
  diagnosticDiagnosisSummary: string;
  diagnosticOrganicControl: string;
  diagnosticChemicalTreatment: string;
  diagnosticPreventiveActions: string;
  diagnosticBtnDosage: string;
  diagnosticBtnChat: string;
  diagnosticServiceNotice: string;
  diagnosticOfflineBanner: string;
  diagnosticDismiss: string;

  // Dosage Calculator
  dosageModalTitle: string;
  dosagePlotArea: string;
  dosagePlotAreaPlaceholder: string;
  dosageSprayerCapacity: string;
  dosageAppMethod: string;
  dosageMethodManual: string;
  dosageMethodMotorized: string;
  dosageComputeBtn: string;
  dosageComputing: string;
  dosageTanksNeeded: string;
  dosageTanksSubtitle: string;
  dosageDilution: string;
  dosageDilutionSubtitle: string;
  dosageRainWindow: string;
  dosageRainMargin: string;
  dosageEconomicRisk: string;
  dosageProjectedLoss: string;
  dosagePPE: string;
  dosageClose: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  es: {
    // Navigation & Controls
    langName: 'Español',
    themeToggle: 'Cambiar Tema',
    themeLight: 'Modo Claro',
    themeDark: 'Modo Oscuro',
    brandTagline: 'Inteligencia Fitosanitaria Andina',
    andeanHighlands: 'Altiplano de Nariño • Plataforma Fitosanitaria',
    systemStatusSynced: 'Sincronizado',
    systemStatusLive: 'En Vivo',
    farmPlotsHistory: 'Parcelas',
    switchAccount: 'Cambiar Cuenta',
    logOut: 'Cerrar Sesión',

    // Auth Gate
    signInTitle: 'Iniciar Sesión en Finca',
    registerFarmTitle: 'Registrar Nueva Parcela',
    authSubtitleSignIn: 'Ingrese sus credenciales registradas para acceder al escáner y la telemetría.',
    authSubtitleRegister: 'Cree su perfil de agricultor y vincule su parcela andina para iniciar el monitoreo.',
    protectedRouteBadge: 'Ruta Protegida',
    tabSignIn: 'Iniciar Sesión',
    tabRegisterFarm: 'Registrar Finca',
    fieldFullName: 'Nombre Completo / Representante Legal *',
    placeholderFullName: 'Ej. Mateo Narváez',
    fieldFarmName: 'Nombre de Finca / Municipio *',
    placeholderFarmName: 'Ej. Finca Bella Vista - Túquerres',
    fieldEmail: 'Correo Electrónico de Trabajo *',
    placeholderEmail: 'agricultor@agroscan.co',
    fieldPassword: 'Contraseña *',
    placeholderPasswordLogin: 'Ingrese su contraseña',
    placeholderPasswordRegister: 'Mínimo 6 caracteres',
    btnEnterDashboard: 'Entrar al Panel AgroScan',
    btnRegisterFarm: 'Registrar Nueva Finca',
    btnAuthenticating: 'Conectando con la Nube Andina...',
    jwtSecurityNotice: 'Seguridad JWT Bearer Requerida',
    authAlertTitle: 'Alerta de Autenticación',
    heroHeadline: 'AgroScan AI — Inteligencia Fitosanitaria de Altura',
    heroDescription:
      'Empoderando a los agricultores de Nariño con diagnósticos patológicos foliares instantáneos, dosificación de bomba de espalda de 20L y telemetría de riesgo climático.',
    heroBadge: 'Protección de Cultivos para Pequeños Productores',
    heroTrustNotice: 'Motor en Nube FastAPI + MongoDB Atlas',
    heroLocation: 'Departamento de Nariño, Colombia',

    // Feature Pills in Hero
    pillGeminiVision: 'Visión Multimodal Gemini 2.5 Flash',
    pillDosageEngine: 'Motor de Dosificación para Bomba de 20L',
    pillWeatherRisk: 'Riesgo de Lavado por Lluvia Andina',

    // Dashboard Metrics & Headers
    dashboardActiveParcel: 'Sesión de Parcela Activa:',
    dashboardFarmer: 'Agricultor:',
    dashboardRole: 'Rol:',
    metricFoliarCoverage: 'Cobertura Foliar',
    metricCoverageStatus: 'Parámetros óptimos en Nariño',
    metricAlertsActive: 'Alertas Activas',
    metricAlertsOutbreak: 'Brotes bacterianos o fúngicos detectados',
    metricAlertsZero: 'Cero brotes severos activos',
    metricMonitoredLots: 'Lotes Monitoreados',
    metricParcelsMapped: 'Parcelas Mapeadas',
    metricPlotIdentifier: 'Indexado por identificador de parcela',
    metricOffThreadEngine: 'Motor en Segundo Plano',
    metricZeroUILockup: 'Cero bloqueo en fotos de alta resolución',

    // Crop Scanner
    scannerCropType: '1. Seleccione Cultivo Andino',
    scannerCropSubtitle: 'Calibrado para pisos térmicos de Nariño',
    scannerPlotName: '2. Identificador de Lote o Parcela',
    scannerPlotPlaceholder: 'Ej. Lote A - Surco Norte, Lote 4, Invernadero 2...',
    scannerUploadTitle: '3. Subir o Capturar Foto de la Planta',
    scannerUploadPrompt: 'Arrastre y suelte una foto de la hoja o haga clic para seleccionar',
    scannerDropActive: 'Suelte la foto de la hoja aquí...',
    scannerReplacePhoto: 'Cambiar Foto',
    scannerWorkerRunning: 'Optimizando foto en segundo plano...',
    scannerWorkerDone: 'Compresión Web Worker Completa',
    scannerSpeed: 'Velocidad:',
    scannerRunBtn: 'Ejecutar Diagnóstico con Gemini 2.5 Flash',
    scannerAnalyzingBtn: 'Analizando Síntomas Foliares con Gemini 2.5 Flash...',
    scannerDownscalingBtn: 'Optimizando imagen en hilo de trabajo...',

    // Andean Crops
    cropPotato: 'Papa',
    cropPotatoVariety: 'Pastusa Suprema / Diacol Capiro',
    cropCoffee: 'Café',
    cropCoffeeVariety: 'Castillo Nariño / Caturra Especial',
    cropCorn: 'Maíz',
    cropCornVariety: 'Choclo Nariñense / Capia',
    cropTomato: 'Tomate',
    cropTomatoVariety: 'Chonto Andino / Larga Vida',

    // Diagnostic Report
    diagnosticReportTitle: 'Reporte de Evaluación Fitosanitaria',
    diagnosticReadyTitle: 'Listo para Diagnóstico de Cultivos Andinos',
    diagnosticReadyDesc:
      'Seleccione su cultivo, asigne el lote de la finca y suba una foto de la hoja para activar el análisis Gemini 2.5 Flash con persistencia en MongoDB Atlas.',
    diagnosticConfidence: 'Confianza de la IA',
    diagnosticSeverity: 'Nivel de Severidad',
    diagnosticScientificName: 'Nombre Científico:',
    diagnosticSymptoms: 'Síntomas Clave Observados',
    diagnosticDiagnosisSummary: 'Dictamen Agronómico y Contexto Andino',
    diagnosticOrganicControl: 'Manejo Biológico y Orgánico',
    diagnosticChemicalTreatment: 'Intervención Química Curativa',
    diagnosticPreventiveActions: 'Acciones Preventivas y Culturales',
    diagnosticBtnDosage: 'Calcular Dosificación (Bomba 20L)',
    diagnosticBtnChat: 'Consultar Asistente Agronómico',
    diagnosticServiceNotice: 'Aviso del Servicio de Diagnóstico',
    diagnosticOfflineBanner:
      'Error de servicio de diagnóstico: mostrando vista previa andina local calibrada.',
    diagnosticDismiss: 'Descartar',

    // Dosage Calculator
    dosageModalTitle: 'Calculadora de Dosificación de Bomba de Espalda (20L)',
    dosagePlotArea: 'Área de la Parcela en Metros Cuadrados (m²)',
    dosagePlotAreaPlaceholder: 'Ej. 2,500 m² (cuarto de hectárea)',
    dosageSprayerCapacity: 'Capacidad de Bomba de Espalda',
    dosageAppMethod: 'Método de Aplicación',
    dosageMethodManual: 'Bomba Manual de Espalda 20L',
    dosageMethodMotorized: 'Nebulizadora Motorizada',
    dosageComputeBtn: 'Calcular Dosis y Ventana Climática',
    dosageComputing: 'Calculando dilución química y riesgo meteorológico andino...',
    dosageTanksNeeded: 'Tanques de 20L Requeridos',
    dosageTanksSubtitle: 'Volumen total de caldo de aspersión estimado',
    dosageDilution: 'Dosis por Tanque de 20L',
    dosageDilutionSubtitle: 'Concentración exacta recomendada por tanque',
    dosageRainWindow: 'Ventana de Seguridad contra Lluvia',
    dosageRainMargin: 'Margen mínimo antes de precipitaciones para evitar lavado',
    dosageEconomicRisk: 'Proyección de Riesgo de Pérdida Económica',
    dosageProjectedLoss: 'Pérdida proyectada sin intervención oportuna',
    dosagePPE: 'Equipo de Protección Personal (EPP) Obligatorio',
    dosageClose: 'Cerrar Calculadora',
  },
  en: {
    // Navigation & Controls
    langName: 'English',
    themeToggle: 'Toggle Theme',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    brandTagline: 'Andean Phytosanitary Intelligence',
    andeanHighlands: 'Nariño Andean Highlands • Phytosanitary AI Platform',
    systemStatusSynced: 'Synced',
    systemStatusLive: 'Live',
    farmPlotsHistory: 'Farm Plots',
    switchAccount: 'Switch Account',
    logOut: 'Log Out',

    // Auth Gate
    signInTitle: 'Sign In to Farm Dashboard',
    registerFarmTitle: 'Register New Farm Parcel',
    authSubtitleSignIn: 'Enter your registered credentials to access diagnostic scanning and plot telemetry.',
    authSubtitleRegister: 'Create your farmer profile and link your Andean parcel to start phytosanitary monitoring.',
    protectedRouteBadge: 'Protected Route',
    tabSignIn: 'Sign In',
    tabRegisterFarm: 'Register Farm',
    fieldFullName: 'Full Name / Legal Representative *',
    placeholderFullName: 'e.g. Mateo Narváez',
    fieldFarmName: 'Farm Name / Municipality *',
    placeholderFarmName: 'e.g. Finca Bella Vista - Túquerres Plateau',
    fieldEmail: 'Work Email Address *',
    placeholderEmail: 'farmer@agroscan.co',
    fieldPassword: 'Password *',
    placeholderPasswordLogin: 'Enter your account password',
    placeholderPasswordRegister: 'Minimum 6 characters',
    btnEnterDashboard: 'Enter AgroScan Dashboard',
    btnRegisterFarm: 'Register New Farm',
    btnAuthenticating: 'Connecting to Andean Cloud...',
    jwtSecurityNotice: 'JWT Bearer Security Required',
    authAlertTitle: 'Authentication Alert',
    heroHeadline: 'AgroScan AI — High-Altitude Phytosanitary Intelligence',
    heroDescription:
      'Empowering farmers across Nariño with instant multimodal leaf pathology diagnostics, precision 20L backpack sprayer dilution ratios, and microclimatic rainfall risk telemetry.',
    heroBadge: 'Andean Smallholder Crop Protection',
    heroTrustNotice: 'FastAPI Backend • MongoDB Atlas Cloud Engine',
    heroLocation: 'Department of Nariño, Colombia',

    // Feature Pills in Hero
    pillGeminiVision: 'Gemini 2.5 Flash Multimodal Vision',
    pillDosageEngine: '20L Sprayer Dosage Engine',
    pillWeatherRisk: 'Andean Weather Wash-Off Risk',

    // Dashboard Metrics & Headers
    dashboardActiveParcel: 'Active Parcel Session:',
    dashboardFarmer: 'Farmer:',
    dashboardRole: 'Role:',
    metricFoliarCoverage: 'Foliar Coverage',
    metricCoverageStatus: 'Optimal parameters across Nariño',
    metricAlertsActive: 'Active Alerts',
    metricAlertsOutbreak: 'Fungal or bacterial outbreaks detected',
    metricAlertsZero: 'Zero high-severity outbreaks active',
    metricMonitoredLots: 'Monitored Lots',
    metricParcelsMapped: 'Parcels Mapped',
    metricPlotIdentifier: 'Indexed by farm plot identifier',
    metricOffThreadEngine: 'Off-Thread Engine',
    metricZeroUILockup: 'Zero UI lockup on high-resolution leaf photos',

    // Crop Scanner
    scannerCropType: '1. Select Andean Crop',
    scannerCropSubtitle: 'Calibrated for Nariño altitude zones',
    scannerPlotName: '2. Farm Plot Identifier',
    scannerPlotPlaceholder: 'e.g., Plot A - North Furrow, Lot 4, Greenhouse 2...',
    scannerUploadTitle: '3. Upload or Capture Plant Photo',
    scannerUploadPrompt: 'Drag and drop leaf photo here or click to browse',
    scannerDropActive: 'Drop leaf photo here...',
    scannerReplacePhoto: 'Replace Photo',
    scannerWorkerRunning: 'Optimizing photo in worker thread...',
    scannerWorkerDone: 'Worker Compression Complete',
    scannerSpeed: 'Speed:',
    scannerRunBtn: 'Run Plant Health Diagnostic with Gemini 2.5 Flash',
    scannerAnalyzingBtn: 'Analyzing Foliage Symptoms with Gemini 2.5 Flash...',
    scannerDownscalingBtn: 'Downscaling on Worker Thread...',

    // Andean Crops
    cropPotato: 'Potato',
    cropPotatoVariety: 'Pastusa Suprema / Diacol Capiro',
    cropCoffee: 'Coffee',
    cropCoffeeVariety: 'Castillo Nariño / Caturra Special',
    cropCorn: 'Corn',
    cropCornVariety: 'Choclo Nariñense / Capia',
    cropTomato: 'Tomato',
    cropTomatoVariety: 'Chonto Andino / Larga Vida',

    // Diagnostic Report
    diagnosticReportTitle: 'Phytosanitary Assessment Report',
    diagnosticReadyTitle: 'Ready for Andean Crop Health Diagnostic',
    diagnosticReadyDesc:
      'Select your crop, designate the farm plot or lot, and upload a leaf photo to trigger Gemini 2.5 Flash analysis with MongoDB Atlas persistence.',
    diagnosticConfidence: 'AI Confidence',
    diagnosticSeverity: 'Severity Level',
    diagnosticScientificName: 'Scientific Name:',
    diagnosticSymptoms: 'Observed Foliar Symptoms',
    diagnosticDiagnosisSummary: 'Agronomic Assessment & Andean Context',
    diagnosticOrganicControl: 'Biological & Organic Control',
    diagnosticChemicalTreatment: 'Chemical Curative Intervention',
    diagnosticPreventiveActions: 'Cultural & Preventive Measures',
    diagnosticBtnDosage: 'Compute 20L Backpack Dosage',
    diagnosticBtnChat: 'Consult Agronomic Assistant',
    diagnosticServiceNotice: 'Diagnostic Service Notice',
    diagnosticOfflineBanner:
      'Diagnostic service error: displaying calibrated offline Andean diagnostic preview.',
    diagnosticDismiss: 'Dismiss',

    // Dosage Calculator
    dosageModalTitle: 'AI Backpack Sprayer Dosage Calculator (20L)',
    dosagePlotArea: 'Plot Area in Square Meters (m²)',
    dosagePlotAreaPlaceholder: 'e.g. 2,500 m² (quarter hectare)',
    dosageSprayerCapacity: 'Backpack Sprayer Capacity',
    dosageAppMethod: 'Application Method',
    dosageMethodManual: 'Manual 20L Backpack',
    dosageMethodMotorized: 'Motorized Mist Blower',
    dosageComputeBtn: 'Compute AI Field Dosage & Weather Window',
    dosageComputing: 'Calculating precise chemical dilution and Andean weather risk...',
    dosageTanksNeeded: '20L Tanks Needed',
    dosageTanksSubtitle: 'Total spray mix volume required',
    dosageDilution: 'Dosage per 20L Tank',
    dosageDilutionSubtitle: 'Concentration recommended per tank load',
    dosageRainWindow: 'Rain Safety Margin',
    dosageRainMargin: 'Minimum hours before rain to avoid chemical wash-off',
    dosageEconomicRisk: 'Projected Economic Loss Risk',
    dosageProjectedLoss: 'Estimated loss without timely intervention',
    dosagePPE: 'Mandatory Personal Protective Equipment (PPE)',
    dosageClose: 'Close Calculator',
  },
};
