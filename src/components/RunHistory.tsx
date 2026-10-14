import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Navigation,
  Flame,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { RunRecord } from '../types';
import { formatDuration, formatPace } from '../utils/runCalculator';
import { exportRunsToCsv } from '../utils/storage';

interface RunHistoryProps {
  runs: RunRecord[];
  onDeleteRun: (id: string) => void;
  onClearAll: () => void;
  onNavigateToRun: () => void;
}

export const RunHistory: React.FC<RunHistoryProps> = ({
  runs,
  onDeleteRun,
  onClearAll,
  onNavigateToRun,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | '30min_only'>('all');
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  // Stats calculation
  const totalRuns = runs.length;
  const totalDistanceKm = runs.reduce((acc, r) => acc + (r.distanceKm || 0), 0);
  const totalCalories = runs.reduce((acc, r) => acc + (r.caloriesBurned || 0), 0);
  const totalTimeSeconds = runs.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
  const completedTargetCount = runs.filter((r) => r.completedTarget30Min).length;

  const filteredRuns = runs.filter((r) => {
    if (filterMode === '30min_only' && !r.completedTarget30Min) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const dateStr = new Date(r.date).toLocaleDateString('th-TH');
      const notes = (r.notes || '').toLowerCase();
      return dateStr.includes(term) || notes.includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide mb-2">
              <Calendar className="w-3.5 h-3.5" /> บันทึกย้อนหลัง (Local Storage)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ประวัติการวิ่ง VCR 30 นาที
            </h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              ข้อมูลถูกจัดเก็บไว้ในหน่วยความจำของอุปกรณ์ (เปรียบเสมือน SQLite / SharedPreferences ในแอปมือถือ)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportRunsToCsv(runs)}
              disabled={runs.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              ส่งออก CSV (Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>ระยะทางรวมทั้งหมด</span>
            <Navigation className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalDistanceKm.toFixed(1)} <span className="text-sm font-bold text-slate-400">km</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            จากการวิ่งทั้งหมด {totalRuns} ครั้ง
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>แคลอรีที่เผาผลาญรวม</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
            {totalCalories.toLocaleString()} <span className="text-sm font-bold text-slate-400">kcal</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            คำนวณตามน้ำหนักและ METs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>เวลารวมที่ออกกำลังกาย</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {formatDuration(totalTimeSeconds)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ชั่วโมง : นาที : วินาที
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>พิชิตเป้า 30 นาที (VCR)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {completedTargetCount} <span className="text-sm font-bold text-slate-400">/ {totalRuns} ครั้ง</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalRuns > 0 ? `${((completedTargetCount / totalRuns) * 100).toFixed(0)}% อัตราสำเร็จ` : '-'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาวันที่ หรือบันทึกโน้ต..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              ทั้งหมด ({runs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('30min_only')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterMode === '30min_only'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              ครบ 30 นาที ({completedTargetCount})
            </button>
          </div>

          {runs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการวิ่งทั้งหมด?')) {
                  onClearAll();
                }
              }}
              title="ล้างประวัติทั้งหมด"
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredRuns.length > 0 ? (
          filteredRuns.map((run) => {
            const runDate = new Date(run.date);
            const dateStr = runDate.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = runDate.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-sm cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Date & Status */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      run.completedTarget30Min
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    }`}
                  >
                    {run.completedTarget30Min ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <Activity className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">
                        {dateStr}
                      </span>
                      <span className="text-xs text-slate-400">{timeStr} น.</span>
                      {run.completedTarget30Min && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          ✓ ครบ 30 นาที VCR
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {run.mode === 'gps' ? 'โหมด GPS จริง' : 'โหมดในร่ม / ลู่วิ่ง'}
                      </span>
                      {run.averageHeartRate && (
                        <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                          ❤️ {run.averageHeartRate} BPM
                        </span>
                      )}
                      {run.watchSource && (
                        <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          ⌚ {run.watchSource}
                        </span>
                      )}
                      {run.notes && (
                        <span className="italic text-slate-400 truncate max-w-xs">
                          "{run.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics Numbers */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-center sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">ระยะทาง</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {run.distanceKm.toFixed(2)} <span className="text-xs font-normal">km</span>
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">เวลา</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {formatDuration(run.durationSeconds)}
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">เพซ</span>
                    <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono">
                      {formatPace(run.averagePaceMinPerKm)}
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">แคลอรี</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                      {run.caloriesBurned} <span className="text-xs font-normal">kcal</span>
                    </span>
                  </div>

                  {/* Delete individual button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                        onDeleteRun(run.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">
              ยังไม่มีประวัติการวิ่งที่ตรงกับเงื่อนไข
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              เริ่มต้นบันทึกการวิ่งทดสอบ VCR 30 นาทีเพื่อเริ่มเก็บสถิติความฟิตของคุณ
            </p>
            <button
              type="button"
              onClick={onNavigateToRun}
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow hover:opacity-95 transition"
            >
              เริ่มวิ่งครั้งใหม่
            </button>
          </div>
        )}
      </div>

      {/* Run Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase">
                  รายละเอียดการวิ่ง
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {new Date(selectedRun.date).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Completed badge if applicable */}
            {selectedRun.completedTarget30Min ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>ผ่านการทดสอบ VCR 30 นาที:</strong> วิ่งต่อเนื่องครบ 1,800 วินาที
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>วิ่งเป็นเวลา {formatDuration(selectedRun.durationSeconds)} (ยังไม่ครบ 30 นาที)</span>
              </div>
            )}

            {/* Grid of detailed stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block font-medium">ระยะทางรวม</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedRun.distanceKm.toFixed(2)} km
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block font-medium">พลังงานเผาผลาญ</span>
                <span className="text-2xl font-black text-orange-500">
                  {selectedRun.caloriesBurned} kcal
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block font-medium">เพซเฉลี่ย (Pace)</span>
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                  {formatPace(selectedRun.averagePaceMinPerKm)}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block font-medium">ความเร็วเฉลี่ย (VCR)</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {selectedRun.averageSpeedKmh.toFixed(1)} km/h
                </span>
              </div>

              {selectedRun.averageHeartRate && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">อัตราการเต้นของหัวใจ</span>
                    <span className="text-xl font-black text-rose-500 flex items-center gap-1.5 mt-0.5">
                      ❤️ เฉลี่ย {selectedRun.averageHeartRate} BPM
                      {selectedRun.maxHeartRate && (
                        <span className="text-xs font-normal text-slate-400">
                          (สูงสุด {selectedRun.maxHeartRate} BPM)
                        </span>
                      )}
                    </span>
                  </div>
                  {selectedRun.watchSource && (
                    <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                      ⌚ {selectedRun.watchSource}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedRun.notes && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">บันทึกเพิ่มเติม:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{selectedRun.notes}"
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                    onDeleteRun(selectedRun.id);
                    setSelectedRun(null);
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> ลบรายการนี้
              </button>
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
