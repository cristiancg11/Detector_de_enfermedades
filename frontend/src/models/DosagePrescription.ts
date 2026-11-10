/**
 * AgroScan AI - DosagePrescription Domain Model.
 *
 * Encapsulates precision calibration for standard 20L agricultural backpack sprayers,
 * Andean high-altitude microclimatic weather risk, and economic crop protection metrics.
 */

export interface DosageCalculationRequest {
  diagnostic_id: string;
  crop_type: string;
  disease_name: string;
  plot_area_m2: number;
  sprayer_capacity_liters: number;
  application_method: 'Manual 20L Backpack' | 'Motorized Mist Blower' | string;
}

export interface DosageCalculationResponse {
  diagnostic_id: string;
  crop_type: string;
  disease_name: string;
  plot_area_m2: number;
  sprayer_capacity_liters: number;
  application_method: string;
  total_water_liters: number;
  tanks_needed: number;
  product_name: string;
  dose_per_tank_grams_or_cc: number;
  total_product_grams_or_kg: string;
  water_volume_per_ha_liters: number;
  weather_condition: string;
  hours_before_rain: number;
  rain_washoff_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  economic_loss_percentage: number;
  ppe_requirements: string[];
  application_notes: string[];
  calculated_at: string;
}

export class DosagePrescription {
  public readonly diagnosticId: string;
  public readonly cropType: string;
  public readonly diseaseName: string;
  public readonly plotAreaM2: number;
  public readonly sprayerCapacityLiters: number;
  public readonly applicationMethod: string;
  public readonly totalWaterLiters: number;
  public readonly tanksNeeded: number;
  public readonly productName: string;
  public readonly dosePerTankGramsOrCc: number;
  public readonly totalProductGramsOrKg: string;
  public readonly waterVolumePerHaLiters: number;
  public readonly weatherCondition: string;
  public readonly hoursBeforeRain: number;
  public readonly rainWashoffRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  public readonly economicLossPercentage: number;
  public readonly ppeRequirements: string[];
  public readonly applicationNotes: string[];
  public readonly calculatedAt: string;

  constructor(data: DosageCalculationResponse) {
    this.diagnosticId = data.diagnostic_id;
    this.cropType = data.crop_type;
    this.diseaseName = data.disease_name;
    this.plotAreaM2 = data.plot_area_m2;
    this.sprayerCapacityLiters = data.sprayer_capacity_liters || 20;
    this.applicationMethod = data.application_method;
    this.totalWaterLiters = data.total_water_liters;
    this.tanksNeeded = data.tanks_needed;
    this.productName = data.product_name;
    this.dosePerTankGramsOrCc = data.dose_per_tank_grams_or_cc;
    this.totalProductGramsOrKg = data.total_product_grams_or_kg;
    this.waterVolumePerHaLiters = data.water_volume_per_ha_liters;
    this.weatherCondition = data.weather_condition;
    this.hoursBeforeRain = data.hours_before_rain;
    this.rainWashoffRisk = data.rain_washoff_risk;
    this.economicLossPercentage = data.economic_loss_percentage;
    this.ppeRequirements = data.ppe_requirements || [];
    this.applicationNotes = data.application_notes || [];
    this.calculatedAt = data.calculated_at || new Date().toISOString();
  }

  /**
   * Returns the ceiling integer value of 20L backpack sprayer tanks needed.
   */
  public getTanksRounded(): number {
    return Math.max(1, Math.ceil(this.tanksNeeded));
  }

  /**
   * Returns Tailwind styling classes based on projected economic crop loss percentage.
   */
  public getRiskColor(): {
    text: string;
    bg: string;
    border: string;
    bar: string;
    badge: string;
  } {
    if (this.economicLossPercentage >= 65) {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-800/60',
        bar: 'bg-rose-500',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      };
    }
    if (this.economicLossPercentage >= 40) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-800/60',
        bar: 'bg-amber-500',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    if (this.economicLossPercentage >= 20) {
      return {
        text: 'text-yellow-400',
        bg: 'bg-yellow-950/40',
        border: 'border-yellow-800/60',
        bar: 'bg-yellow-500',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      };
    }
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800/60',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  }

  /**
   * Formats hours before anticipated rainfall with contextual safety alert badges.
   */
  public getRainWarning(): {
    label: string;
    badgeClass: string;
    description: string;
    isSafe: boolean;
    hoursText: string;
  } {
    if (this.hoursBeforeRain >= 6) {
      return {
        label: 'Optimal Weather Window',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        description: `Rain is not forecasted for at least ${this.hoursBeforeRain} hours. Chemical adhesion and foliar uptake are optimal.`,
        isSafe: true,
        hoursText: `${this.hoursBeforeRain} hours window`,
      };
    }
    if (this.hoursBeforeRain >= 4) {
      return {
        label: 'Marginal Spray Window',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        description: `Rain is expected in approximately ${this.hoursBeforeRain} hours. Spray immediately and add an agricultural surfactant/sticker to prevent foliar wash-off.`,
        isSafe: true,
        hoursText: `${this.hoursBeforeRain} hours to rainfall`,
      };
    }
    return {
      label: 'High Wash-off Risk Alert',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: `Rain predicted within ${this.hoursBeforeRain} hours. High probability of chemical runoff and environmental leaching. Postpone application until the front clears.`,
      isSafe: false,
      hoursText: `Only ${this.hoursBeforeRain} hours until rain`,
    };
  }

  /**
   * Deserializes server response or local storage payload into DosagePrescription instance.
   */
  public static fromJSON(raw: DosageCalculationResponse): DosagePrescription {
    return new DosagePrescription(raw);
  }

  /**
   * Generates resilient local calibration when the remote API service is unreachable.
   */
  public static calculateLocal(req: DosageCalculationRequest): DosagePrescription {
    const area = Math.max(100, req.plot_area_m2 || 2500);
    const capacity = req.sprayer_capacity_liters || 20;

    // Typical Andean high-plateau agronomic calibration: 400 L/ha water volume
    const waterPerHa = 400;
    const totalWater = Math.round((area / 10000) * waterPerHa);
    const effectiveWater = Math.max(capacity, totalWater);
    const tanks = effectiveWater / capacity;

    // Determine targeted product based on crop and disease
    let productName = 'Bordeaux Mixture (Copper Sulfate + Hydrated Lime)';
    let dosePerTank = 50; // grams per 20L
    let economicLoss = 68;

    const diseaseLower = (req.disease_name || '').toLowerCase();
    if (diseaseLower.includes('blight') || diseaseLower.includes('phytophthora')) {
      productName = 'Metalaxyl-M + Mancozeb (Ridomil Gold 68 WG)';
      dosePerTank = 50;
      economicLoss = 78;
    } else if (diseaseLower.includes('rust') || diseaseLower.includes('roya')) {
      productName = 'Cyproconazole + Azoxystrobin (Amistar Xtra)';
      dosePerTank = 35;
      economicLoss = 65;
    } else if (diseaseLower.includes('bacteria') || diseaseLower.includes('wilt')) {
      productName = 'Copper Hydroxide (Kocide 2000)';
      dosePerTank = 40;
      economicLoss = 72;
    }

    const totalProductGrams = Math.round(dosePerTank * Math.ceil(tanks));
    const totalProductFormatted =
      totalProductGrams >= 1000
        ? `${(totalProductGrams / 1000).toFixed(2)} kg`
        : `${totalProductGrams} grams`;

    // High Andean afternoon rainfall simulation (typically 5 hours window in morning)
    const simulatedHoursBeforeRain = 5;

    return new DosagePrescription({
      diagnostic_id: req.diagnostic_id,
      crop_type: req.crop_type,
      disease_name: req.disease_name,
      plot_area_m2: area,
      sprayer_capacity_liters: capacity,
      application_method: req.application_method || 'Manual 20L Backpack',
      total_water_liters: effectiveWater,
      tanks_needed: tanks,
      product_name: productName,
      dose_per_tank_grams_or_cc: dosePerTank,
      total_product_grams_or_kg: totalProductFormatted,
      water_volume_per_ha_liters: waterPerHa,
      weather_condition: 'Partly Cloudy • High Mountain Moisture (2,850m)',
      hours_before_rain: simulatedHoursBeforeRain,
      rain_washoff_risk: 'LOW',
      economic_loss_percentage: economicLoss,
      ppe_requirements: [
        'Nitrile Chemical Gloves',
        'Organic Vapor Respirator Mask',
        'Protective Splash Goggles',
        'Waterproof Neoprene Rubber Boots',
      ],
      application_notes: [
        'Calibrate backpack nozzle cone for medium droplet size (250-300 microns).',
        'Spray during early morning calm wind (< 8 km/h) before thermal updrafts form.',
        'Ensure uniform coverage on both abaxial (underside) and adaxial leaf surfaces.',
        'Respect the mandatory 14-day pre-harvest interval (PHI) for Andean crops.',
      ],
      calculated_at: new Date().toISOString(),
    });
  }
}
