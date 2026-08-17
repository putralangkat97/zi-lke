import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LKE } from '../types';
import { calculateScores } from './ScoreSummaryBanner';
import { 
  Calendar, 
  Building, 
  Database, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Archive, 
  Copy, 
  PlusCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';

export function AdminTemplateManager() {
  const queryClient = useQueryClient();
  const [newPeriod, setNewPeriod] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [baseLkeId, setBaseLkeId] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch current active LKE
  const { data: activeLke } = useQuery<LKE>({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  // Fetch all LKEs
  const { data: lkesList, isLoading } = useQuery<LKE[]>({
    queryKey: ['lkes'],
    queryFn: () => fetch('/api/lkes').then(res => res.json())
  });

  // Mutation to switch active LKE
  const switchLkeMutation = useMutation({
    mutationFn: (activeId: string) => 
      fetch('/api/lkes/active/id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeId })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSuccessMsg('Berhasil beralih periode LKE aktif! 🔄');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: () => {
      setErrorMsg('Gagal beralih periode LKE.');
    }
  });

  // Mutation to create/duplicate template
  const createLkeMutation = useMutation({
    mutationFn: (data: { period: string; unit_name: string; baseLkeId?: string }) =>
      fetch('/api/lkes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (newLke) => {
      queryClient.invalidateQueries();
      setNewPeriod('');
      setNewUnitName('');
      setBaseLkeId('');
      setSuccessMsg(`Berhasil menduplikasi template & mengaktifkan LKE baru periode ${newLke.period}! 🚀`);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: () => {
      setErrorMsg('Gagal membuat template LKE baru.');
    }
  });

  // Mutation to delete template
  const deleteLkeMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/lkes/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSuccessMsg('Arsip LKE berhasil dihapus permanent.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal menghapus arsip LKE.');
    }
  });

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const yearNum = parseInt(newPeriod, 10);
    if (!newPeriod || isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      setErrorMsg('Tahun LKE harus berupa angka tahun yang valid (2020 - 2100).');
      return;
    }

    if (lkesList?.some(l => l.period === newPeriod)) {
      setErrorMsg(`Evaluasi LKE untuk periode tahun ${newPeriod} sudah ada.`);
      return;
    }

    createLkeMutation.mutate({
      period: newPeriod,
      unit_name: newUnitName.trim() || activeLke?.unit_name || 'Kantor Pertanahan Kota Binjai',
      baseLkeId: baseLkeId || undefined
    });
  };

  const handleDelete = (id: string, period: string) => {
    if (confirm(`⚠️ PERINGATAN KERAS! Apakah Anda yakin ingin menghapus seluruh data LKE Tahun ${period}?\nTindakan ini tidak dapat dibatalkan.`)) {
      deleteLkeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 font-medium">
        Memuat data manajemen periode...
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
      
      {/* Title block with subtext */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
            <Sliders className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Periode & Duplikasi Template LKE
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Kelola daftar evaluasi tahunan, tentukan periode LKE yang aktif, serta duplikasi struktur Area Pengungkit untuk tahun baru.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Side: Duplication Form (Span 5) */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-700 stroke-[2.5]" />
            <h4 className="font-extrabold text-slate-900 text-base">Inisiasi & Duplikat LKE Baru</h4>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
            <strong>Cara Kerja Duplikasi:</strong> Sistem akan mencontoh seluruh bagan indikator, kriteria nilai, dan bobot dari LKE Sumber, lalu membuat satu lembaran LKE bersih (Draft) untuk tahun sasaran Anda.
          </div>

          <form onSubmit={handleDuplicate} className="space-y-4">
            {/* Target Year input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tahun Target Evaluasi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  required
                  placeholder="Contoh: 2027"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Base LKE selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Salin Struktur Dari (Sumber)
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <select
                  required
                  value={baseLkeId}
                  onChange={(e) => setBaseLkeId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800 cursor-pointer appearance-none"
                >
                  <option value="">-- Pilih LKE Sumber Struktur --</option>
                  {lkesList?.map((l) => (
                    <option key={l.id} value={l.id}>
                      LKE {l.period} ({l.unit_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Unit Name input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nama Unit Kerja Instansi
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kosongkan untuk menyamakan dengan LKE saat ini"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createLkeMutation.isPending}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              {createLkeMutation.isPending ? 'Menduplikasi...' : 'Duplikat & Inisiasi LKE 🚀'}
            </button>
          </form>
        </div>

        {/* Right Side: List of LKE Years with Real-Time Metrics (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700 stroke-[2.5]" />
              <h4 className="font-extrabold text-slate-900 text-base">Daftar Arsip & Periode Terdaftar</h4>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
              Total: {lkesList?.length || 0} Periode
            </span>
          </div>

          <div className="space-y-4">
            {lkesList?.map((item) => {
              const isActive = item.id === activeLke?.id;
              const scores = calculateScores(item);

              return (
                <div 
                  key={item.id} 
                  className={`border p-5 rounded-2xl transition duration-150 ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Year & Active Status badge */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl font-black text-slate-900">
                          LKE Periode {item.period}
                        </span>
                        
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Archive className="w-2.5 h-2.5" />
                            HISTORICAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                        {item.unit_name}
                      </p>
                    </div>

                    {/* Right: State / Year Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                        Status: {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Real-Time Score Overview */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl mt-4 text-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Progres Terisi</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">
                        {scores.filledIndicators}/{scores.totalIndicators} ({scores.progressPercent}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Nilai Mandiri</div>
                      <div className="text-sm font-black text-emerald-700 mt-0.5">
                        {scores.totalUnitScore.toFixed(2)} <span className="text-[10px] text-slate-400">({scores.percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Nilai TPI</div>
                      <div className="text-sm font-black text-blue-700 mt-0.5">
                        {scores.totalTPIScore.toFixed(2)} <span className="text-[10px] text-slate-400">({scores.tpiPercentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons footer inside card */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {!isActive && (
                      <>
                        <button
                          onClick={() => switchLkeMutation.mutate(item.id)}
                          disabled={switchLkeMutation.isPending}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                          Aktifkan LKE Periode Ini
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.period)}
                          disabled={deleteLkeMutation.isPending}
                          className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg transition cursor-pointer"
                          title="Hapus LKE"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {isActive && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 py-1">
                        ✓ LKE Utama yang Sedang Berjalan
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
