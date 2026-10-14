import React from 'react';
import {
  Activity,
  Scale,
  Timer,
  History,
  Code,
  Smartphone,
  Monitor,
  Heart,
} from 'lucide-react';

export type NavTab = 'bmi' | 'vcr' | 'history' | 'code';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const tabs = [
    {
      id: 'bmi' as NavTab,
      label: 'คำนวณ BMI',
      icon: Scale,
      color: 'emerald',
    },
    {
      id: 'vcr' as NavTab,
      label: 'วิ่ง VCR 30 นาที',
      icon: Timer,
      color: 'teal',
    },
    {
      id: 'history' as NavTab,
      label: 'ประวัติการวิ่ง',
      icon: History,
      color: 'blue',
    },
    {
      id: 'code' as NavTab,
      label: 'โค้ด Flutter / RN',
      icon: Code,
      color: 'purple',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5">
              FitTrack <span className="text-teal-600 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 font-bold">VCR 30</span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              BMI Health & 30-Minute Cardio Run Tracker
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions: Phone Frame View Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMobileFrame}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isMobileFrame
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="สลับโหมดจำลองมือถือ (Mobile Bezel Frame)"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>มุมมองเต็มจอ</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>จำลองหน้าจอมือถือ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (shown on mobile devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
