import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { BmiCalculator } from './components/BmiCalculator';
import { VcrTracker } from './components/VcrTracker';
import { RunHistory } from './components/RunHistory';
import { CodeExporter } from './components/CodeExporter';
import { UserProfile, RunRecord, ConnectedWatch } from './types';
import { WatchSyncModal } from './components/WatchSyncModal';
import {
  getSavedProfile,
  saveProfile,
  getSavedRuns,
  saveRunRecord,
  deleteRunRecord,
  clearAllRuns,
} from './utils/storage';
import {
  Wifi,
  Battery,
  Signal,
  CheckCircle,
  HelpCircle,
  Smartphone,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('bmi');
  const [profile, setProfile] = useState<UserProfile>(getSavedProfile());
  const [runs, setRuns] = useState<RunRecord[]>(getSavedRuns());
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Smartwatch state
  const [isWatchModalOpen, setIsWatchModalOpen] = useState<boolean>(false);
  const [connectedWatch, setConnectedWatch] = useState<ConnectedWatch | null>(null);

  // Clock for mobile status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update profile
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  // Add new run
  const handleSaveRun = (record: RunRecord) => {
    const updated = saveRunRecord(record);
    setRuns(updated);
  };

  // Delete run
  const handleDeleteRun = (id: string) => {
    const updated = deleteRunRecord(id);
    setRuns(updated);
  };

  // Clear runs
  const handleClearAll = () => {
    clearAllRuns();
    setRuns([]);
  };

  // Content switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bmi':
        return (
          <BmiCalculator
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToRun={() => setActiveTab('vcr')}
          />
        );
      case 'vcr':
        return (
          <VcrTracker
            profile={profile}
            onSaveRun={handleSaveRun}
            onNavigateToHistory={() => setActiveTab('history')}
            connectedWatch={connectedWatch}
            onOpenWatchModal={() => setIsWatchModalOpen(true)}
          />
        );
      case 'history':
        return (
          <RunHistory
            runs={runs}
            onDeleteRun={handleDeleteRun}
            onClearAll={handleClearAll}
            onNavigateToRun={() => setActiveTab('vcr')}
          />
        );
      case 'code':
        return <CodeExporter />;
      default:
        return null;
    }
  };

  const handleImportRun = (newRecord: RunRecord) => {
    const updated = saveRunRecord(newRecord);
    setRuns(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        connectedWatch={connectedWatch}
        onOpenWatchModal={() => setIsWatchModalOpen(true)}
      />

      {/* Watch Sync Hub Modal */}
      <WatchSyncModal
        isOpen={isWatchModalOpen}
        onClose={() => setIsWatchModalOpen(false)}
        connectedWatch={connectedWatch}
        onConnectWatch={(watch) => setConnectedWatch(watch)}
        onDisconnectWatch={() => setConnectedWatch(null)}
        onImportRun={handleImportRun}
        profile={profile}
      />

      <main className="flex-1 flex flex-col items-center justify-start py-6 px-3 sm:px-6">
        {isMobileFrame ? (
          // Mobile Phone Bezel Frame Simulation
          <div className="w-full max-w-[420px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/10 relative my-2">
            {/* Phone Camera Notch & Speaker */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-36 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Simulated Mobile Screen Container */}
            <div className="w-full h-[760px] bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden flex flex-col relative border border-slate-200 dark:border-slate-800">
              {/* Mobile Status Bar */}
              <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 font-bold z-40 select-none">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Scrollable Mobile Content */}
              <div className="flex-1 overflow-y-auto px-4 py-2 pb-24">
                {renderTabContent()}
              </div>

              {/* Home bar indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full pointer-events-none" />
            </div>
          </div>
        ) : (
          // Responsive Full-Screen App Layout
          <div className="w-full max-w-5xl mx-auto pb-16">
            {renderTabContent()}
          </div>
        )}
      </main>

      {/* Footer info banner */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 hidden sm:block">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            FitTrack VCR 30 • คำนวณ BMI และเกณฑ์สุขภาพตามกระทรวงสาธารณสุข & ทดสอบวิ่ง VCR 30 นาที
          </span>
          <span className="font-medium text-slate-500">
            Local Storage Persistence Active (Offline-ready)
          </span>
        </div>
      </footer>
    </div>
  );
}
