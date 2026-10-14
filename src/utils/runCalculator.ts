import { GpsCoordinate } from '../types';

/**
 * Calculates distance between two GPS coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns MET (Metabolic Equivalent of Task) based on speed in km/h
 * According to Compendium of Physical Activities
 */
export function getRunningMet(speedKmh: number): number {
  if (speedKmh <= 0) return 1.0;
  if (speedKmh < 5.0) return 3.5; // Walking
  if (speedKmh < 6.5) return 6.0; // Jogging slow
  if (speedKmh < 8.0) return 8.0; // 7.5 km/h
  if (speedKmh < 9.0) return 8.8; // 8.5 km/h
  if (speedKmh < 10.0) return 9.8; // ~6:10 min/km
  if (speedKmh < 11.5) return 11.0; // ~5:30 min/km
  if (speedKmh < 13.0) return 11.8; // ~5:00 min/km
  if (speedKmh < 15.0) return 12.8; // ~4:20 min/km
  return 14.5; // Fast sprinting / marathon elite
}

/**
 * Calculates calories burned:
 * Calories = MET * weightKg * (durationSeconds / 3600)
 */
export function calculateCaloriesBurned(
  durationSeconds: number,
  distanceKm: number,
  weightKg: number
): number {
  if (durationSeconds <= 0 || weightKg <= 0) return 0;
  const hours = durationSeconds / 3600;
  const speedKmh = hours > 0 ? distanceKm / hours : 0;
  const met = getRunningMet(speedKmh);
  const calories = met * weightKg * hours;
  return Math.max(0, Math.round(calories * 10) / 10);
}

/**
 * Formats duration seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats pace in minutes and seconds per km (e.g. 5'45" /km)
 */
export function formatPace(paceMinPerKm: number): string {
  if (!isFinite(paceMinPerKm) || paceMinPerKm <= 0 || paceMinPerKm > 60) {
    return "--'--\"";
  }
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

/**
 * Calculate pace in min/km
 */
export function calculatePace(durationSeconds: number, distanceKm: number): number {
  if (distanceKm <= 0.02 || durationSeconds <= 0) return 0;
  const minutes = durationSeconds / 60;
  return minutes / distanceKm;
}
