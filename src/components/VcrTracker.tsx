import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Navigation,
  Flame,
  Clock,
  Gauge,
  Trophy,
  Save,
  Sliders,
  CheckCircle2,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';
import { UserProfile, RunRecord, RunStatus, GpsCoordinate } from '../types';
import {
  calculateHaversineDistanceKm,
  calculateCaloriesBurned,
  calculatePace,
  formatDuration,
  formatPace,
} from '../utils/runCalculator';
import { soundEffects } from '../utils/soundEffects';

interface VcrTrackerProps {
  profile: UserProfile;
  onSaveRun: (record: RunRecord) => void;
  onNavigateToHistory: () => void;
}

const TARGET_DURATION_SECONDS = 30 * 60; // 30 minutes = 1800 seconds

export const VcrTracker: React.FC<VcrTrackerProps> = ({
  profile,
  onSaveRun,
  onNavigateToHistory,
}) => {
  const [status, setStatus] = useState<RunStatus>('idle');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [trackingMode, setTrackingMode] = useState<'gps' | 'indoor'>('indoor'); // Default indoor/simulator so user can test immediately anywhere
  const [simulatedSpeedKmh, setSimulatedSpeedKmh] = useState<number>(9.5); // Default running speed ~6:18 min/km

  // Target 30-min celebration flag
  const [hasCelebrated30Min, setHasCelebrated30Min] = useState<boolean>(false);

  // Save Modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [runNotes, setRunNotes] = useState<string>('');

  // GPS state
  const [gpsError, setGpsError] = useState<string | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number; timestamp: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const coordinatesRef = useRef<GpsCoordinate[]>([]);

  // Timer Ref
  const timerIntervalRef = useRef<number | null>(null);

  // Real-time calculations
  const weight = profile.weightKg || 65;
  const currentPace = calculatePace(durationSeconds, distanceKm);
  const caloriesBurned = calculateCaloriesBurned(durationSeconds, distanceKm, weight);
  const criticalVelocityKmh = durationSeconds > 0 ? (distanceKm / (durationSeconds / 3600)) : 0;
  const progressPercent = Math.min(100, (durationSeconds / TARGET_DURATION_SECONDS) * 100);
  const remainingSeconds = Math.max(0, TARGET_DURATION_SECONDS - durationSeconds);

  // 30-min milestone celebration
  useEffect(() => {
    if (durationSeconds >= TARGET_DURATION_SECONDS && !hasCelebrated30Min) {
      setHasCelebrated30Min(true);
      if (soundEnabled) {
        soundEffects.playFinish();
      }
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [durationSeconds, hasCelebrated30Min, soundEnabled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
    };
  }, []);

  // Timer runner
  useEffect(() => {
    if (status === 'running') {
      timerIntervalRef.current = window.setInterval(() => {
        setDurationSeconds((prev) => prev + 1);

        // If in indoor/simulator mode, simulate incremental distance
        if (trackingMode === 'indoor') {
          // Distance per second = speed (km/h) / 3600
          // Add slight natural variation ±5%
          const speedVariation = simulatedSpeedKmh * (0.97 + Math.random() * 0.06);
          setCurrentSpeedKmh(Math.round(speedVariation * 10) / 10);
          setDistanceKm((prev) => prev + speedVariation / 3600);
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, trackingMode, simulatedSpeedKmh]);

  // GPS Watcher
  const startGpsWatch = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับระบบพิกัด GPS');
      setTrackingMode('indoor');
      return;
    }

    setGpsError(null);
    lastCoordRef.current = null;

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude, speed } = position.coords;
          const currentTimestamp = position.timestamp || Date.now();

          const newCoord: GpsCoordinate = {
            latitude,
            longitude,
            altitude,
            speed,
            timestamp: currentTimestamp,
          };

          coordinatesRef.current.push(newCoord);

          if (lastCoordRef.current) {
            const deltaDistKm = calculateHaversineDistanceKm(lastCoordRef.current, {
              latitude,
              longitude,
            });

            // Filter out minor jitter (< 3 meters) and impossible teleportation (> 30 m/s)
            const deltaTimeSec = (currentTimestamp - lastCoordRef.current.timestamp) / 1000;
            if (deltaTimeSec > 0) {
              const speedMps = (deltaDistKm * 1000) / deltaTimeSec;
              if (deltaDistKm > 0.003 && speedMps < 20) {
                setDistanceKm((prev) => prev + deltaDistKm);
                const currentKmH = speed ? speed * 3.6 : (deltaDistKm / (deltaTimeSec / 3600));
                setCurrentSpeedKmh(Math.round(currentKmH * 10) / 10);
              }
            }
          }

          lastCoordRef.current = { latitude, longitude, timestamp: currentTimestamp };
        },
        (err) => {
          console.warn('GPS Error:', err.message);
          setGpsError('ไม่สามารถจับสัญญาณ GPS ได้ แนะนำให้ใช้โหมดจำลองหรือวิ่งในร่ม');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        }
      );
    } catch (e) {
      setGpsError('เกิดข้อผิดพลาดในการเปิดระบบ GPS');
    }
  };

  const stopGpsWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Actions
  const handleStart = () => {
    if (soundEnabled) soundEffects.playStart();
    setStatus('running');
    if (trackingMode === 'gps') {
      startGpsWatch();
    }
  };

  const handlePause = () => {
    if (soundEnabled) soundEffects.playPause();
    setStatus('paused');
    stopGpsWatch();
  };

  const handleResume = () => {
    if (soundEnabled) soundEffects.playResume();
    setStatus('running');
    if (trackingMode === 'gps') {
      startGpsWatch();
    }
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการรีเซ็ตการวิ่งครั้งนี้ใช่หรือไม่?')) {
      stopGpsWatch();
      setStatus('idle');
      setDurationSeconds(0);
      setDistanceKm(0);
      setCurrentSpeedKmh(0);
      setHasCelebrated30Min(false);
      coordinatesRef.current = [];
      lastCoordRef.current = null;
    }
  };

  const handleOpenSaveModal = () => {
    if (durationSeconds < 5 && distanceKm < 0.01) {
      alert('ระยะเวลาหรือระยะทางน้อยเกินไป ยังไม่สามารถบันทึกได้');
      return;
    }
    handlePause();
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    const avgSpeed = durationSeconds > 0 ? (distanceKm / (durationSeconds / 3600)) : 0;
    const finalPace = calculatePace(durationSeconds, distanceKm);

    const record: RunRecord = {
      id: `run-${Date.now()}`,
      date: new Date().toISOString(),
      durationSeconds,
      distanceKm: Math.round(distanceKm * 100) / 100,
      caloriesBurned: Math.round(caloriesBurned),
      averagePaceMinPerKm: Math.round(finalPace * 100) / 100,
      averageSpeedKmh: Math.round(avgSpeed * 100) / 100,
      criticalVelocityKmh: Math.round(avgSpeed * 100) / 100,
      completedTarget30Min: durationSeconds >= TARGET_DURATION_SECONDS,
      notes: runNotes.trim() || undefined,
      mode: trackingMode,
    };

    onSaveRun(record);
    setShowSaveModal(false);

    // Reset state
    stopGpsWatch();
    setStatus('idle');
    setDurationSeconds(0);
    setDistanceKm(0);
    setCurrentSpeedKmh(0);
    setHasCelebrated30Min(false);
    setRunNotes('');

    // Switch to history
    onNavigateToHistory();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide">
                <Trophy className="w-3.5 h-3.5 text-amber-300" /> ฟังก์ชัน 2: VCR 30-Minute Run Tracker
              </span>
              <span className="text-xs bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full text-cyan-100 font-medium">
                เป้าหมาย 30:00 นาที
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ระบบตรวจสอบและบันทึกการวิ่ง VCR 30 นาที
            </h2>
            <p className="text-cyan-100 text-sm mt-1 max-w-xl">
              บันทึกการทดสอบสมรรถภาพหัวใจและหลอดเลือด (Velocity Critical Run 30-Min) คำนวณเพซ ระยะทาง และพลังงาน
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector & Runner Profile Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Mode Selector */}
        <div className="sm:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase ml-2">โหมดการวัด:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                disabled={status === 'running'}
                onClick={() => setTrackingMode('indoor')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  trackingMode === 'indoor'
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${status === 'running' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Sliders className="w-3.5 h-3.5" /> ในร่ม / จำลองลู่วิ่ง
              </button>
              <button
                type="button"
                disabled={status === 'running'}
                onClick={() => setTrackingMode('gps')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  trackingMode === 'gps'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${status === 'running' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Navigation className="w-3.5 h-3.5" /> GPS กลางแจ้ง (จริง)
              </button>
            </div>
          </div>

          {/* Quick simulator speed slider if in indoor mode */}
          {trackingMode === 'indoor' && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>ความเร็วจำลอง:</span>
              <span className="font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg">
                {simulatedSpeedKmh.toFixed(1)} km/h
              </span>
              <input
                type="range"
                min="5"
                max="16"
                step="0.5"
                value={simulatedSpeedKmh}
                onChange={(e) => setSimulatedSpeedKmh(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none accent-cyan-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* User Weight link */}
        <div className="sm:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">น้ำหนักที่ใช้คำนวณแคลอรี:</span>
          <span className="font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
            {profile.weightKg} kg (ดึงจาก BMI)
          </span>
        </div>
      </div>

      {gpsError && trackingMode === 'gps' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <Compass className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Main Runner Console */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Big Timer Circle (Left) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Circular SVG Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="7"
                  fill="none"
                />
                {/* 30-min Target Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-cyan-500 transition-all duration-500"
                  strokeWidth="7"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  {status === 'running'
                    ? 'กำลังวิ่ง...'
                    : status === 'paused'
                    ? 'หยุดชั่วคราว'
                    : 'เวลาที่วิ่ง (MM:SS)'}
                </span>

                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 font-mono">
                  {formatDuration(durationSeconds)}
                </div>

                {/* Remaining to 30 mins */}
                <div className="text-xs font-semibold mt-1">
                  {durationSeconds >= TARGET_DURATION_SECONDS ? (
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเป้า 30 นาทีแล้ว!
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      เหลืออีก {formatDuration(remainingSeconds)} นาที
                    </span>
                  )}
                </div>

                {/* Progress pill */}
                <div className="mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                  {progressPercent.toFixed(0)}% ของเป้าหมาย VCR
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Metrics Dashboard (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Distance */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-500" />
                  ระยะทาง
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {distanceKm.toFixed(2)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">กิโลเมตร (km)</span>
              </div>

              {/* Calories */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  แคลอรีเผาผลาญ
                </div>
                <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                  {Math.round(caloriesBurned)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">กิโลแคลอรี (kcal)</span>
              </div>

              {/* Average Pace */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  เพซเฉลี่ย
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {formatPace(currentPace)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">นาที / กม.</span>
              </div>

              {/* Speed / Critical Velocity */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" />
                  ความเร็วเฉลี่ย
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {criticalVelocityKmh.toFixed(1)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">กม./ชม. (km/h)</span>
              </div>
            </div>

            {/* VCR Index Card */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-4 rounded-2xl border border-cyan-200/60 dark:border-cyan-800/40 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    เกี่ยวกับเกณฑ์การทดสอบวิ่ง VCR 30 นาที (Velocity Critical Run)
                  </h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                    VCR 30 นาที เป็นการทดสอบความเร็วแอโรบิกสูงสุดที่รักษาระดับได้ (Critical Velocity / Lactate Threshold)
                    หากวิ่งครบ 30 นาที ระยะทางที่ได้จะสะท้อนถึงระดับสมรรถภาพหัวใจและปอดของคุณอย่างแม่นยำ
                  </p>
                </div>
              </div>
            </div>

            {/* Control Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {status === 'idle' && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  เริ่มการวิ่ง (Start)
                </button>
              )}

              {status === 'running' && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    className="flex-1 py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Pause className="w-5 h-5 fill-white" />
                    หยุดชั่วคราว (Pause)
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenSaveModal}
                    className="py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    สิ้นสุดและบันทึก (Stop/Save)
                  </button>
                </>
              )}

              {status === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    วิ่งต่อ (Resume)
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenSaveModal}
                    className="py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Save className="w-5 h-5" />
                    สิ้นสุดและบันทึก (Stop/Save)
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="เริ่มใหม่"
                    className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-teal-600" />
                บันทึกผลการวิ่ง VCR 30 นาที
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Run Summary stats in modal */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-xs text-slate-400 block">เวลาที่ใช้</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatDuration(durationSeconds)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-xs text-slate-400 block">ระยะทาง</span>
                <span className="text-xl font-black text-cyan-600">
                  {distanceKm.toFixed(2)} km
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-xs text-slate-400 block">แคลอรี</span>
                <span className="text-xl font-black text-orange-500">
                  {Math.round(caloriesBurned)} kcal
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-xs text-slate-400 block">เพซเฉลี่ย</span>
                <span className="text-xl font-black text-teal-600">
                  {formatPace(currentPace)}
                </span>
              </div>
            </div>

            {durationSeconds >= TARGET_DURATION_SECONDS && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>ยอดเยี่ยมมาก! คุณวิ่งครบตามเป้าหมาย 30 นาทีตามเกณฑ์ VCR</span>
              </div>
            )}

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                บันทึกความรู้สึก / สภาพแวดล้อม (ตัวเลือก)
              </label>
              <textarea
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                placeholder="เช่น อากาศดี ไม่เหนื่อยมาก จังหวะการก้าวสม่ำเสมอ..."
                rows={3}
                className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm font-bold shadow-md transition"
              >
                บันทึกลงในระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
