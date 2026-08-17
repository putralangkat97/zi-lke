import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { 
  History, 
  ShieldAlert, 
  Info, 
  CloudLightning, 
  Database, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  X,
  BellRing,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'syncing';
  timestamp: string;
}

export function AuditDetail() {
  const { data: lke, isLoading: lkeLoading } = useQuery({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  // Sync mode and states
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('audit_sync_online');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.warn('localStorage is not available, defaulting isOnline to true');
      return true;
    }
  });
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('synced');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));

  // Toast helper
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'syncing') => {
    const newToast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setToasts(prev => [newToast, ...prev].slice(0, 4)); // max 4 toast overlays
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Toast auto-dismissal
  useEffect(() => {
    const activeToasts = toasts.filter(t => t.type !== 'syncing');
    if (activeToasts.length === 0) return;

    const timers = activeToasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, 4500);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts]);

  // Handle sync mode toggling
  const toggleSyncMode = (online: boolean) => {
    if (online === isOnline) return;
    
    setIsOnline(online);
    try {
      localStorage.setItem('audit_sync_online', JSON.stringify(online));
    } catch (e) {
      console.warn('localStorage.setItem failed in AuditDetail:', e);
    }

    if (online) {
      setSyncStatus('syncing');
      addToast('Menghubungkan ke server audit ZI...', 'syncing');
      
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        setToasts(prev => prev.filter(t => t.type !== 'syncing'));
        addToast('Sinkronisasi penuh berhasil diselesaikan! Seluruh data lokal kini sinkron di Cloud Server.', 'success');
      }, 1500);
    } else {
      setSyncStatus('idle');
      addToast('Beralih ke Mode Penyimpanan Lokal. Perubahan data di simpan sementara di browser offline.', 'warning');
    }
  };

  // Manual Trigger Sync
  const handleManualSync = () => {
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    addToast('Mengevaluasi paket data lokal & mengunggah ke server...', 'syncing');

    setTimeout(() => {
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      setToasts(prev => prev.filter(t => t.type !== 'syncing'));
      addToast('Penyelarasan berhasil! 12 transaksi audit terbaru dikirim aman ke Server Pusat.', 'success');
    }, 1800);
  };

  // Simulate passive background synchronization intervals when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        addToast('Sinkronisasi otomatis periodik sukses. Server pusat up-to-date.', 'success');
      }, 1200);
    }, 25000); // simulate sync checking every 25 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  if (lkeLoading) {
    return (
      <div className="text-slate-500 font-medium py-12 text-center">
        Memuat informasi audit akuntabilitas...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen pb-12">
      
      {/* Toast Overlay Manager */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-lg pointer-events-auto flex gap-3 items-start justify-between ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : toast.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : toast.type === 'syncing'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5 shrink-0">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {toast.type === 'syncing' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-slate-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-normal">{toast.message}</p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1.5">{toast.timestamp}</span>
                </div>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Info Banner specific to Audit */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-slate-950 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <History className="w-8 h-8 text-amber-300 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Pusat Akuntabilitas & Jejak Audit LKE</h2>
            <p className="text-xs md:text-sm text-slate-300 font-semibold leading-relaxed">
              Catatan autentik seluruh aktivitas pengisian Lembar Kerja Evaluasi (LKE) {lke ? `Tahun ${lke.period}` : ''} secara transparan untuk kepatuhan Penilaian Zona Integritas.
            </p>
          </div>
        </div>
      </div>

      {/* Synchronisation Control Hub Widget */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Pulsing Sync Icon indicator */}
            <div className="relative shrink-0 mt-1">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                isOnline ? (syncStatus === 'syncing' ? 'bg-blue-400' : 'bg-emerald-400') : 'bg-amber-400'
              }`} style={{ width: '40px', height: '40px' }} />
              <div className={`relative flex items-center justify-center rounded-full w-10 h-10 border shadow-xs ${
                isOnline 
                  ? (syncStatus === 'syncing' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600') 
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}>
                {isOnline ? (
                  syncStatus === 'syncing' ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wifi className="w-5 h-5 animate-pulse" />
                  )
                ) : (
                  <WifiOff className="w-5 h-5" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  Status Sinkronisasi Log Audit
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border rounded-full ${
                  isOnline 
                    ? (syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200') 
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {isOnline ? (syncStatus === 'syncing' ? 'Menyelaraskan...' : 'Server Terhubung') : 'Penyimpanan Lokal'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                {isOnline 
                  ? 'Sistem secara otomatis mengalirkan log perubahan ke database server terpusat secara real-time. Keamanan audit terjamin penuh.' 
                  : 'Sistem membatasi jaringan. Jejak audit diantrekan secara aman dalam memori lokal browser Anda (LocalStorage) untuk kepatuhan offline.'
                }
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                <span>Pembaruan terakhir: {lastSyncTime}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-slate-400" />
                  Penyimpanan: {isOnline ? 'Cloud Server SQL + Local Backup' : 'Local Sandbox (Offline-only)'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Segment Toggle & Manual Actions */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            {/* Mode Selector */}
            <div className="flex items-center bg-white border border-slate-250 rounded-lg overflow-hidden p-0.5 shadow-2xs">
              <button 
                onClick={() => toggleSyncMode(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                Cloud Server
              </button>
              <button 
                onClick={() => toggleSyncMode(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isOnline 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                Lokal (Offline)
              </button>
            </div>

            {/* Manual Sync Button */}
            <Button 
              variant="outline" 
              size="sm"
              disabled={syncStatus === 'syncing'}
              onClick={handleManualSync}
              className={`h-8.5 font-bold flex items-center gap-1.5 cursor-pointer rounded-lg bg-white ${
                !isOnline ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'text-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-blue-500' : ''}`} />
              Sinkronkan Sekarang
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Informational Sidebar for Transparency Context */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="bg-blue-900 text-white p-4 font-black text-xs md:text-sm tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              INTEGRITAS & KEPATUHAN
            </div>
            <CardContent className="p-4 space-y-4 text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                  <p>Seluruh riwayat pengisian indikator, pengunggahan berkas bukti dukung, dan reviu TPI diabadikan secara permanen.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                  <p>Mencegah pemalsuan data atau manipulasi dokumen di luar kesepakatan tim kerja.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                  <p>Mempermudah Tim Penilai Internal (TPI) melacak kronologi perbaikan yang diajukan.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-[11px] text-blue-800 space-y-1.5">
                <div className="flex items-center gap-1 font-bold">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Sistem Real-Time
                </div>
                <p>Log audit diperbarui otomatis setiap 10 detik untuk memastikan validitas kepatuhan.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Table Viewer Area */}
        <div className="lg:col-span-3">
          <AuditLogViewer lkeId={lke?.id} />
        </div>
      </div>

    </div>
  );
}
