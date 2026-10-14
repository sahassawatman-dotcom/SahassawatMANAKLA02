import { ConnectedWatch, HeartRateZone, WatchBrand } from '../types';

// Standard Bluetooth SIG UUIDs
export const BLE_HEART_RATE_SERVICE = 'heart_rate';
export const BLE_HEART_RATE_MEASUREMENT = 'heart_rate_measurement';

/**
 * Calculates max heart rate and training zones based on age (Tanaka / Fox Formula)
 */
export function getHeartRateZones(age = 28): HeartRateZone[] {
  const maxHr = Math.round(208 - 0.7 * age); // Tanaka formula (accurate for active adults)

  return [
    {
      zone: 1,
      label: 'Zone 1: วอร์มอัพ ฟื้นฟู (Warm-up)',
      minBpm: Math.round(maxHr * 0.5),
      maxBpm: Math.round(maxHr * 0.6),
      color: '#38bdf8', // Sky
      description: 'กระตุ้นการไหลเวียนโลหิต หายใจสบาย เหมาะสำหรับอบอุ่นร่างกายและคูลดาวน์',
    },
    {
      zone: 2,
      label: 'Zone 2: เผาผลาญไขมัน (Fat Burn)',
      minBpm: Math.round(maxHr * 0.6),
      maxBpm: Math.round(maxHr * 0.7),
      color: '#10b981', // Emerald
      description: 'ร่างกายใช้พลังงานจากไขมันเป็นหลัก สามารถวิ่งต่อเนื่องและสนทนาได้เป็นประโยค',
    },
    {
      zone: 3,
      label: 'Zone 3: หัวใจและปอด (Aerobic Cardio)',
      minBpm: Math.round(maxHr * 0.7),
      maxBpm: Math.round(maxHr * 0.8),
      color: '#f59e0b', // Amber
      description: 'เสริมสร้างความแข็งแกร่งของกล้ามเนื้อหัวใจและระบบไหลเวียนโลหิต หายใจกระชั้นขึ้น',
    },
    {
      zone: 4,
      label: 'Zone 4: VCR เทรชโฮลด์ (Lactate Threshold)',
      minBpm: Math.round(maxHr * 0.8),
      maxBpm: Math.round(maxHr * 0.9),
      color: '#f97316', // Orange
      description: 'โซนเป้าหมายของการทดสอบ VCR 30 นาที ร่างกายทนต่อกรดแลกติกและเพิ่มความเร็วสูงสุด',
    },
    {
      zone: 5,
      label: 'Zone 5: พลังงานสูงสุด (VO2 Max / Sprint)',
      minBpm: Math.round(maxHr * 0.9),
      maxBpm: maxHr,
      color: '#ef4444', // Red
      description: 'ออกแรงสูงสุด เหนื่อยมาก ทำได้ในระยะเวลาสั้นๆ 1-3 นาที',
    },
  ];
}

export function getCurrentZone(bpm: number, zones: HeartRateZone[]): HeartRateZone | null {
  if (bpm <= 0) return null;
  for (const z of zones) {
    if (bpm >= z.minBpm && bpm <= z.maxBpm) return z;
  }
  if (bpm > zones[zones.length - 1].maxBpm) return zones[zones.length - 1];
  if (bpm < zones[0].minBpm) return zones[0];
  return null;
}

/**
 * Parses Bluetooth GATT Heart Rate Measurement value buffer
 * Format per Bluetooth SIG Heart Rate Profile specification
 */
export function parseHeartRateValue(value: DataView): number {
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  let heartRate = 0;
  if (rate16Bits) {
    heartRate = value.getUint16(1, /*littleEndian=*/ true);
  } else {
    heartRate = value.getUint8(1);
  }
  return heartRate;
}

export class BleHeartRateManager {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;
  private onHeartRateCallback: ((bpm: number) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connectRealDevice(
    onHeartRate: (bpm: number) => void,
    onDisconnect: () => void
  ): Promise<{ name: string; brand: WatchBrand }> {
    if (!this.isSupported()) {
      throw new Error('เบราว์เซอร์นี้ยังไม่เปิดใช้งาน Web Bluetooth (แนะนำใช้ Chrome / Edge บน Android/PC/Mac)');
    }

    this.onHeartRateCallback = onHeartRate;
    this.onDisconnectCallback = onDisconnect;

    const nav = navigator as any;
    this.device = await nav.bluetooth.requestDevice({
      filters: [{ services: [BLE_HEART_RATE_SERVICE] }],
      optionalServices: ['battery_service'],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      if (this.onDisconnectCallback) this.onDisconnectCallback();
    });

    this.server = await this.device.gatt.connect();
    const service = await this.server.getPrimaryService(BLE_HEART_RATE_SERVICE);
    this.characteristic = await service.getCharacteristic(BLE_HEART_RATE_MEASUREMENT);

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      const bpm = parseHeartRateValue(event.target.value);
      if (this.onHeartRateCallback && bpm > 0) {
        this.onHeartRateCallback(bpm);
      }
    });

    const deviceName: string = this.device.name || 'Bluetooth Watch';
    let brand: WatchBrand = 'generic';
    const lower = deviceName.toLowerCase();
    if (lower.includes('apple') || lower.includes('watch')) brand = 'apple';
    else if (lower.includes('garmin')) brand = 'garmin';
    else if (lower.includes('galaxy') || lower.includes('samsung')) brand = 'samsung';
    else if (lower.includes('polar')) brand = 'polar';
    else if (lower.includes('fitbit')) brand = 'fitbit';

    return { name: deviceName, brand };
  }

  public disconnect(): void {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }
}
