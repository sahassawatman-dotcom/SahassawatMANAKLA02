import { RunRecord } from '../types';
import { calculateHaversineDistanceKm, calculateCaloriesBurned, calculatePace } from './runCalculator';

/**
 * Parses GPX XML text into a RunRecord
 */
export function parseGpxRun(gpxText: string, userWeightKg = 65): Partial<RunRecord> {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, 'application/xml');

  const trkpts = xml.querySelectorAll('trkpt');
  if (!trkpts || trkpts.length === 0) {
    throw new Error('ไม่พบข้อมูลพิกัดการวิ่งในไฟล์ GPX');
  }

  const coords: { lat: number; lon: number; time: Date; hr?: number }[] = [];

  trkpts.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    const timeEl = pt.querySelector('time');
    const hrEl = pt.querySelector('hr, HeartRateBpm value, ns3\\:hr');

    if (lat && lon && timeEl && timeEl.textContent) {
      coords.push({
        lat,
        lon,
        time: new Date(timeEl.textContent),
        hr: hrEl && hrEl.textContent ? parseInt(hrEl.textContent, 10) : undefined,
      });
    }
  });

  if (coords.length < 2) {
    throw new Error('ข้อมูลในไฟล์ GPX สั้นเกินไปสำหรับการประมวลผล');
  }

  // Calculate total distance & duration
  let totalDistKm = 0;
  for (let i = 1; i < coords.length; i++) {
    totalDistKm += calculateHaversineDistanceKm(
      { latitude: coords[i - 1].lat, longitude: coords[i - 1].lon },
      { latitude: coords[i].lat, longitude: coords[i].lon }
    );
  }

  const startTime = coords[0].time.getTime();
  const endTime = coords[coords.length - 1].time.getTime();
  const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));

  const hrValues = coords.filter((c) => c.hr && c.hr > 40 && c.hr < 230).map((c) => c.hr as number);
  const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : undefined;
  const maxHr = hrValues.length > 0 ? Math.max(...hrValues) : undefined;

  const hours = durationSeconds / 3600;
  const avgSpeed = hours > 0 ? totalDistKm / hours : 0;
  const avgPace = calculatePace(durationSeconds, totalDistKm);
  const calories = calculateCaloriesBurned(durationSeconds, totalDistKm, userWeightKg);

  return {
    date: coords[0].time.toISOString(),
    durationSeconds,
    distanceKm: Math.round(totalDistKm * 100) / 100,
    caloriesBurned: Math.round(calories),
    averagePaceMinPerKm: Math.round(avgPace * 100) / 100,
    averageSpeedKmh: Math.round(avgSpeed * 100) / 100,
    criticalVelocityKmh: Math.round(avgSpeed * 100) / 100,
    completedTarget30Min: durationSeconds >= 1800,
    mode: 'gps',
    averageHeartRate: avgHr,
    maxHeartRate: maxHr,
    notes: 'นำเข้าจากไฟล์ Apple Watch / Garmin (GPX)',
    watchSource: 'Apple Watch / Garmin GPX',
  };
}
