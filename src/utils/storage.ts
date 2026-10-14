import { RunRecord, UserProfile } from '../types';

const STORAGE_KEY_RUNS = 'fittrack_run_records_v1';
const STORAGE_KEY_PROFILE = 'fittrack_user_profile_v1';

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 65,
  heightCm: 170,
  gender: 'male',
  age: 28,
  standard: 'asian',
};

// Seed sample run data if none exists so the user immediately sees a lively history
const SAMPLE_RUNS: RunRecord[] = [
  {
    id: 'sample-run-1',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 1800, // Exactly 30 mins
    distanceKm: 4.85,
    caloriesBurned: 320,
    averagePaceMinPerKm: 6.18,
    averageSpeedKmh: 9.7,
    criticalVelocityKmh: 9.7,
    completedTarget30Min: true,
    notes: 'วิ่งทดสอบ VCR ช่วงเช้า ลมเย็นสบาย คุมเพซได้สม่ำเสมอ',
    mode: 'gps',
  },
  {
    id: 'sample-run-2',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 1800,
    distanceKm: 4.62,
    caloriesBurned: 305,
    averagePaceMinPerKm: 6.49,
    averageSpeedKmh: 9.24,
    criticalVelocityKmh: 9.24,
    completedTarget30Min: true,
    notes: 'วิ่งรอบสวนสาธารณะช่วงเย็น',
    mode: 'gps',
  },
  {
    id: 'sample-run-3',
    date: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 1200, // 20 mins
    distanceKm: 2.9,
    caloriesBurned: 195,
    averagePaceMinPerKm: 6.89,
    averageSpeedKmh: 8.7,
    criticalVelocityKmh: 8.7,
    completedTarget30Min: false,
    notes: 'ซ้อมวิ่งเบาๆ ในร่ม วอร์มอัพขาก่อนวิ่งจริง',
    mode: 'indoor',
  },
];

export function getSavedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getSavedRuns(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RUNS);
    if (!raw) {
      // Seed initial sample runs so user has data to explore
      localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(SAMPLE_RUNS));
      return SAMPLE_RUNS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SAMPLE_RUNS;
  }
}

export function saveRunRecord(newRecord: RunRecord): RunRecord[] {
  try {
    const existing = getSavedRuns();
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save run record', e);
    return [];
  }
}

export function deleteRunRecord(runId: string): RunRecord[] {
  try {
    const existing = getSavedRuns();
    const updated = existing.filter((r) => r.id !== runId);
    localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete run record', e);
    return [];
  }
}

export function clearAllRuns(): void {
  try {
    localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear runs', e);
  }
}

export function exportRunsToCsv(runs: RunRecord[]): void {
  if (!runs || runs.length === 0) return;
  const headers = ['ID', 'Date', 'Duration (seconds)', 'Distance (km)', 'Calories (kcal)', 'Pace (min/km)', 'Avg Speed (km/h)', 'Target 30-min Completed', 'Mode', 'Notes'];
  const rows = runs.map((r) => [
    r.id,
    new Date(r.date).toLocaleString('th-TH'),
    r.durationSeconds,
    r.distanceKm.toFixed(2),
    r.caloriesBurned,
    r.averagePaceMinPerKm.toFixed(2),
    r.averageSpeedKmh.toFixed(2),
    r.completedTarget30Min ? 'Yes' : 'No',
    r.mode,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `vcr_runs_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
