import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ScoreSummaryBanner } from '../components/ScoreSummaryBanner';
import { AdminTemplateManager } from '../components/AdminTemplateManager';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { DeadlineAlert } from '../components/DeadlineAlert';
import { LayoutDashboard, Sliders, History, Calendar, Target, CheckSquare, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'audit'>('overview');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then(res => res.json())
  });

  const { data: lke } = useQuery({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  if (!user || !lke || !lke.pokjas) return <div className="text-slate-500 font-medium py-8 text-center">Memuat data dashboard...</div>;

  const hasAdminPrivilege = user.role === 'admin' || user.role === 'tpi';

  // Calculate total weights and counts for quick metrics
  const totalPokjaCount = lke.pokjas.filter((pokja: any) => {
    if ((user.role === 'ketua_pokja' || user.role === 'anggota_pokja') && !user.assigned_pokja?.includes(pokja.code)) {
      return false;
    }
    return true;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Real-time score summary banner - Remains at top for immediate feedback on current standing */}
      <ScoreSummaryBanner />

      {/* Tab Navigation Menu */}
      <div className={`bg-slate-100 p-1.5 rounded-xl border border-slate-200 grid grid-cols-1 ${hasAdminPrivilege ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-1.5 shadow-inner`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-blue-900' : 'text-slate-400'}`} />
          Ringkasan LKE & Area Pokja
        </button>

        {hasAdminPrivilege && (
          <button
            onClick={() => setActiveTab('management')}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
              activeTab === 'management'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeTab === 'management' ? 'text-blue-900' : 'text-slate-400'}`} />
            Manajemen Periode & Template
          </button>
        )}

        <button
          onClick={() => setActiveTab('audit')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <History className={`w-4 h-4 ${activeTab === 'audit' ? 'text-blue-900' : 'text-slate-400'}`} />
          Log Audit Akuntabilitas
        </button>
      </div>

      {/* Tab Panels with AnimatePresence */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <DeadlineAlert targetDateString="2026-08-25" />
              
              {/* Quick Info metrics card row */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Status Evaluasi LKE</CardTitle>
                    <div className="p-1.5 bg-blue-50 text-blue-800 rounded-lg">
                      <Target className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-2xl font-black text-blue-900 tracking-tight">{lke.status}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Periode Penilaian LKE {lke.period}</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Jumlah Pokja Terbuka</CardTitle>
                    <div className="p-1.5 bg-indigo-50 text-indigo-800 rounded-lg">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-2xl font-black text-slate-800 tracking-tight">{totalPokjaCount} Area</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Dari 6 Area Pengungkit ZI</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Unit Kerja Instansi</CardTitle>
                    <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                      <Award className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-lg font-black text-slate-800 tracking-tight truncate" title={lke.unit_name}>{lke.unit_name}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Evaluasi Mandiri Zona Integritas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Area Pokja cards */}
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Progress Area Pengungkit Pokja</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Gunakan menu utama "Lembar Kerja (LKE)" di atas untuk mulai mengisi indikator.</p>
                  </div>
                  {hasAdminPrivilege && (
                    <button
                      onClick={() => alert("Notifikasi pengingat via WhatsApp & Email berhasil dikirim ke seluruh Ketua Pokja!")}
                      className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-blue-200"
                    >
                      <span className="text-sm">🔔</span> Kirim Reminder Tenggat Waktu
                    </button>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {lke.pokjas.map((pokja: any) => {
                    // If user is Ketua Pokja or Anggota Pokja, only show assigned pokja
                    if ((user.role === 'ketua_pokja' || user.role === 'anggota_pokja') && !user.assigned_pokja?.includes(pokja.code)) {
                      return null;
                    }

                    const progressPercent = pokja.progress.total > 0 
                      ? Math.round((pokja.progress.filled / pokja.progress.total) * 100) 
                      : 0;

                    const totalCount = pokja.progress?.total || pokja.indicators?.length || 0;
                    const filledCount = pokja.progress?.filled || 0;
                    const acceptedCount = pokja.indicators?.filter((ind: any) => ind.status === 'reviewed_accepted').length || 0;

                    let statusType: 'belum_diisi' | 'pemeriksaan' | 'ok' = 'pemeriksaan';
                    if (filledCount === 0) {
                      statusType = 'belum_diisi';
                    } else if (acceptedCount === totalCount && totalCount > 0) {
                      statusType = 'ok';
                    }

                    const statusConfig = {
                      belum_diisi: {
                        cardClass: "border-2 border-red-500 hover:border-red-600 shadow-sm bg-white flex flex-col justify-between transition-all duration-150",
                        badge: (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                            Belum Diisi ❌
                          </span>
                        )
                      },
                      pemeriksaan: {
                        cardClass: "border-2 border-amber-500 hover:border-amber-600 shadow-sm bg-white flex flex-col justify-between transition-all duration-150",
                        badge: (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            Pemeriksaan/Revisi ⚠️
                          </span>
                        )
                      },
                      ok: {
                        cardClass: "border-2 border-emerald-500 hover:border-emerald-600 shadow-sm bg-white flex flex-col justify-between transition-all duration-150",
                        badge: (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            Sudah OK ✓ ❇️
                          </span>
                        )
                      }
                    };

                    const currentConfig = statusConfig[statusType];

                    return (
                      <Card key={pokja.code} className={currentConfig.cardClass}>
                        <CardHeader className="pb-3 border-b border-slate-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="bg-blue-900 text-white font-black text-xs px-2 py-0.5 rounded-md mt-0.5 flex-shrink-0">
                                Pokja {pokja.code}
                              </span>
                              <CardTitle className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                                {pokja.name}
                              </CardTitle>
                            </div>
                            <div className="flex-shrink-0">
                              {currentConfig.badge}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 space-y-4 flex-grow flex flex-col justify-between">
                          <div className="space-y-2.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Bobot Area</span>
                              <span className="font-bold text-slate-800">{pokja.weight} %</span>
                            </div>
                            
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Keterisian Indikator</span>
                              <span className="font-bold text-slate-800">{pokja.progress.filled} / {pokja.progress.total} ({progressPercent}%)</span>
                            </div>

                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Butuh Revisi (TPI)</span>
                              {pokja.progress.revision_required > 0 ? (
                                <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md text-[10px]">
                                  {pokja.progress.revision_required} Perlu Tindakan
                                </span>
                              ) : (
                                <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                                  Sesuai
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar visual */}
                          <div className="pt-2">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-900 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'management' && hasAdminPrivilege && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <AdminTemplateManager />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <AuditLogViewer lkeId={lke.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}


