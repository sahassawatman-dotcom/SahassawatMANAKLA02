export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2';

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  categoryLabelTh: string;
  categoryLabelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  descriptionTh: string;
  recommendationsTh: string[];
  dietTipsTh: string[];
  exerciseTipsTh: string[];
  idealWeightMin: number;
  idealWeightMax: number;
  weightDifference: number; // positive = to lose, negative = to gain, 0 = within range
}

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  gender: 'male' | 'female';
  age: number;
  standard: 'asian' | 'who';
}

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
}

export type WatchBrand = 'apple' | 'garmin' | 'samsung' | 'polar' | 'fitbit' | 'generic';

export interface ConnectedWatch {
  id: string;
  name: string;
  brand: WatchBrand;
  connectedAt: string;
  heartRate: number; // BPM
  batteryPercent?: number;
  isSimulated?: boolean;
}

export interface HeartRateZone {
  zone: number;
  label: string;
  minBpm: number;
  maxBpm: number;
  color: string;
  description: string;
}

export interface RunRecord {
  id: string;
  date: string; // ISO string
  durationSeconds: number; // e.g. 1800 for 30 mins
  distanceKm: number;
  caloriesBurned: number;
  averagePaceMinPerKm: number; // min per km
  averageSpeedKmh: number;
  criticalVelocityKmh: number; // VCR speed (km/h) for the 30-min interval
  completedTarget30Min: boolean;
  notes?: string;
  path?: { x: number; y: number }[]; // Normalized or simplified route
  mode: 'gps' | 'indoor' | 'simulated';
  averageHeartRate?: number;
  maxHeartRate?: number;
  watchSource?: string; // e.g. 'Apple Watch Ultra', 'Garmin Forerunner', etc.
}

export type RunStatus = 'idle' | 'running' | 'paused' | 'completed';

