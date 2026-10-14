import React, { useState, useEffect } from 'react';
import { calculateBMI, calculateMetabolicRates } from '../utils/bmiCalculator';
import { UserProfile, BmiResult } from '../types';
import {
  Scale,
  Ruler,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Apple,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';

interface BmiCalculatorProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToRun?: () => void;
}

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({
  profile,
  onUpdateProfile,
  onNavigateToRun,
}) => {
  const [weight, setWeight] = useState<number>(profile.weightKg || 65);
  const [height, setHeight] = useState<number>(profile.heightCm || 170);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [age, setAge] = useState<number>(profile.age || 28);
  const [standard, setStandard] = useState<'asian' | 'who'>(profile.standard || 'asian');
  const [activeAdviceTab, setActiveAdviceTab] = useState<'general' | 'diet' | 'exercise'>('general');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Sync state if profile prop changes
  useEffect(() => {
    setWeight(profile.weightKg);
    setHeight(profile.heightCm);
    setGender(profile.gender);
    setAge(profile.age);
    setStandard(profile.standard);
  }, [profile]);

  // Update profile in parent
  const handleProfileChange = (updated: Partial<UserProfile>) => {
    const newProfile = {
      weightKg: updated.weightKg ?? weight,
      heightCm: updated.heightCm ?? height,
      gender: updated.gender ?? gender,
      age: updated.age ?? age,
      standard: updated.standard ?? standard,
    };
    onUpdateProfile(newProfile);
  };

  const bmiResult: BmiResult | null = calculateBMI(weight, height, standard);
  const metabolic = calculateMetabolicRates(weight, height, age, gender);

  // Quick adjust handlers
  const adjustWeight = (delta: number) => {
    const next = Math.max(25, Math.min(250, Math.round((weight + delta) * 10) / 10));
    setWeight(next);
    handleProfileChange({ weightKg: next });
  };

  const adjustHeight = (delta: number) => {
    const next = Math.max(90, Math.min(240, Math.round((height + delta) * 10) / 10));
    setHeight(next);
    handleProfileChange({ heightCm: next });
  };

  // Helper for gauge pointer position (percentage 0 - 100%)
  // Range from BMI 14 to 36
  const getGaugePercentage = (bmi: number): number => {
    const min = 14;
    const max = 36;
    const clamped = Math.max(min, Math.min(max, bmi));
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> ฟังก์ชัน 1: ดัชนีมวลกาย (BMI)
            </span>
            <div className="flex items-center bg-black/20 backdrop-blur-md rounded-full p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStandard('asian');
                  handleProfileChange({ standard: 'asian' });
                }}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  standard === 'asian'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                เกณฑ์เอเชีย/ไทย
              </button>
              <button
                type="button"
                onClick={() => {
                  setStandard('who');
                  handleProfileChange({ standard: 'who' });
                }}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  standard === 'who'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                เกณฑ์สากล WHO
              </button>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            คำนวณค่าดัชนีมวลกาย (BMI)
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            ประเมินสัดส่วนร่างกายตามมาตรฐานกระทรวงสาธารณสุข พร้อมคำแนะนำโภชนาการ และการออกกำลังกายวิ่ง VCR 30 นาที
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Sliders */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              กรอกข้อมูลสัดส่วนร่างกาย
            </h3>

            {/* Weight Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label htmlFor="weight-input" className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  น้ำหนัก (กิโลกรัม)
                </label>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => adjustWeight(-1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(-0.5)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    -0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(+0.5)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    +0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(+1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="weight-input"
                  type="number"
                  step="0.1"
                  min="25"
                  max="250"
                  value={weight || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setWeight(val);
                    handleProfileChange({ weightKg: val });
                  }}
                  className="w-full text-2xl font-black px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  placeholder="เช่น 65"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  kg
                </span>
              </div>

              <input
                type="range"
                min="35"
                max="140"
                step="0.5"
                value={weight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setWeight(val);
                  handleProfileChange({ weightKg: val });
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Height Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label htmlFor="height-input" className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-teal-500" />
                  ส่วนสูง (เซนติเมตร)
                </label>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => adjustHeight(-1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustHeight(+1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="height-input"
                  type="number"
                  step="0.5"
                  min="90"
                  max="240"
                  value={height || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setHeight(val);
                    handleProfileChange({ heightCm: val });
                  }}
                  className="w-full text-2xl font-black px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  placeholder="เช่น 170"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  cm
                </span>
              </div>

              <input
                type="range"
                min="120"
                max="210"
                step="1"
                value={height}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setHeight(val);
                  handleProfileChange({ heightCm: val });
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            {/* Advanced toggle for Gender & Age (enhances calories & BMR calculations) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 transition"
              >
                {showAdvanced ? '▲ ซ่อนการตั้งค่าเพิ่มเติม' : '▼ เพิ่มเติม: เพศและอายุ (เพื่อคำนวณ BMR/TDEE ที่แม่นยำยิ่งขึ้น)'}
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      เพศ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGender('male');
                          handleProfileChange({ gender: 'male' });
                        }}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          gender === 'male'
                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        ชาย ♂
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGender('female');
                          handleProfileChange({ gender: 'female' });
                        }}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          gender === 'female'
                            ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        หญิง ♀
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      อายุ (ปี)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="110"
                      value={age}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25;
                        setAge(val);
                        handleProfileChange({ age: val });
                      }}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick helper tip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                สูตรคำนวณมาตรฐาน: <strong className="text-slate-700 dark:text-slate-200">BMI = น้ำหนัก (กก.) / [ส่วนสูง (ม.)]²</strong>
                <br />
                น้ำหนักของคุณนี้จะถูกเชื่อมโยงไปยังระบบคำนวณแคลอรีวิ่ง 30 นาทีโดยอัตโนมัติ
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: BMI Result, Visual Meter & Health Recommendations */}
        <div className="lg:col-span-7 space-y-5">
          {bmiResult ? (
            <>
              {/* BMI Score & Status Card */}
              <div
                className={`rounded-3xl p-6 border shadow-sm transition-all relative overflow-hidden bg-white dark:bg-slate-900 ${bmiResult.borderColor}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ผลการประเมินดัชนีมวลกาย
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {bmiResult.bmi.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">kg/m²</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm"
                      style={{
                        backgroundColor: `${bmiResult.color}20`,
                        color: bmiResult.color,
                        border: `1px solid ${bmiResult.color}50`,
                      }}
                    >
                      {bmiResult.category === 'normal' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      {bmiResult.categoryLabelTh}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      เกณฑ์{standard === 'asian' ? 'เอเชีย (กระทรวงสาธารณสุข)' : 'สากล (WHO)'}
                    </p>
                  </div>
                </div>

                {/* Visual BMI Gauge Meter */}
                <div className="mt-6 space-y-2">
                  <div className="relative pt-6">
                    {/* Gauge indicator needle/pointer */}
                    <div
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                      style={{ left: `${getGaugePercentage(bmiResult.bmi)}%` }}
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow">
                        {bmiResult.bmi}
                      </span>
                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-800 dark:border-t-white" />
                    </div>

                    {/* Gradient Meter Bar */}
                    <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-inner">
                      {/* Underweight: < 18.5 */}
                      <div className="bg-sky-400 h-full w-[20%]" title="ผอม (<18.5)" />
                      {/* Normal: 18.5 - 22.9 */}
                      <div className="bg-emerald-500 h-full w-[20%]" title="ปกติ (18.5 - 22.9)" />
                      {/* Overweight: 23 - 24.9 */}
                      <div className="bg-amber-400 h-full w-[10%]" title="ท้วม (23.0 - 24.9)" />
                      {/* Obese 1: 25 - 29.9 */}
                      <div className="bg-orange-500 h-full w-[25%]" title="อ้วน 1 (25.0 - 29.9)" />
                      {/* Obese 2: >= 30 */}
                      <div className="bg-red-500 h-full w-[25%]" title="อ้วน 2 (>=30.0)" />
                    </div>
                  </div>

                  {/* Range labels */}
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-1">
                    <span>ผอม (&lt;18.5)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">สมส่วน (18.5-22.9)</span>
                    <span>ท้วม (23-24.9)</span>
                    <span>อ้วน (25+)</span>
                  </div>
                </div>

                {/* Health summary banner */}
                <div className={`mt-5 p-4 rounded-2xl ${bmiResult.bgColor} border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 text-sm leading-relaxed`}>
                  <p className="font-medium">{bmiResult.descriptionTh}</p>
                </div>

                {/* Ideal weight analysis & BMR / TDEE badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">น้ำหนักที่เหมาะสมสำหรับคุณ</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                        {bmiResult.idealWeightMin} - {bmiResult.idealWeightMax} กก.
                      </span>
                      {bmiResult.weightDifference !== 0 && (
                        <span className="text-[11px] block mt-0.5 text-slate-500 flex items-center gap-1">
                          {bmiResult.weightDifference > 0 ? (
                            <>
                              <TrendingDown className="w-3 h-3 text-amber-500 inline" /> ควรลดอีกประมาณ{' '}
                              <strong className="text-amber-600">{bmiResult.weightDifference} กก.</strong>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3 text-sky-500 inline" /> ควรเพิ่มอีกประมาณ{' '}
                              <strong className="text-sky-600">{Math.abs(bmiResult.weightDifference)} กก.</strong>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">พลังงานเผาผลาญพื้นฐาน (BMR)</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                        ~{metabolic.bmr} kcal/วัน
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        TDEE (ใช้ชีวิตปกติ): ~{metabolic.tdee} kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Guidance & Recommendations Tabs */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    คำแนะนำเพื่อสุขภาพเฉพาะบุคคล
                  </h3>

                  {/* Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveAdviceTab('general')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        activeAdviceTab === 'general'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      คำแนะนำทั่วไป
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdviceTab('diet')}
                      className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        activeAdviceTab === 'diet'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Apple className="w-3.5 h-3.5" /> อาหาร
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdviceTab('exercise')}
                      className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        activeAdviceTab === 'exercise'
                          ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" /> ออกกำลังกาย
                    </button>
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="space-y-2.5 min-h-[140px]">
                  {activeAdviceTab === 'general' && (
                    <ul className="space-y-2">
                      {bmiResult.recommendationsTh.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeAdviceTab === 'diet' && (
                    <ul className="space-y-2">
                      {bmiResult.dietTipsTh.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                          <Apple className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeAdviceTab === 'exercise' && (
                    <div className="space-y-3">
                      <ul className="space-y-2">
                        {bmiResult.exerciseTipsTh.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                            <Zap className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>

                      {onNavigateToRun && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            type="button"
                            onClick={onNavigateToRun}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:opacity-95 transition"
                          >
                            ไปที่หน้าจับเวลาวิ่ง VCR 30 นาที
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500">กรุณากรอกน้ำหนักและส่วนสูงที่ถูกต้องเพื่อคำนวณผลลัพธ์</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
