import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditLog } from '../types';
import { 
  History, 
  User as UserIcon, 
  Calendar, 
  Search, 
  Filter, 
  Shield, 
  Activity, 
  TrendingUp, 
  Clock, 
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface AuditLogViewerProps {
  lkeId?: string;
  indicatorId?: string;
  pokjaCode?: string;
  limit?: number;
  compact?: boolean;
}

export function AuditLogViewer({ lkeId, indicatorId, pokjaCode, limit, compact = false }: AuditLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedPokja, setSelectedPokja] = useState<string>('all');

  // Fetch audit logs
  const { data: logs, isLoading, refetch, isFetching } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', lkeId, indicatorId, pokjaCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lkeId) params.append('lkeId', lkeId);
      if (indicatorId) params.append('indicatorId', indicatorId);
      if (pokjaCode) params.append('pokjaCode', pokjaCode);
      
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 10000, // auto-refresh every 10s for real-time compliance logging
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mb-2" />
        <span className="text-sm font-medium">Memuat log audit akuntabilitas...</span>
      </div>
    );
  }

  // Local filtering
  const filteredLogs = (logs || []).filter(log => {
    if (!log) return false;

    const userName = log.userName || 'Sistem';
    const description = log.details?.description || '';
    const indicatorCode = log.details?.indicatorCode || '';

    // Search matching
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicatorCode.toLowerCase().includes(searchTerm.toLowerCase());

    // Action match
    const matchesAction = actionFilter === 'all' || log.actionType === actionFilter;

    // Pokja match
    const matchesPokja = selectedPokja === 'all' || log.details?.pokjaCode === selectedPokja;

    return matchesSearch && matchesAction && matchesPokja;
  });

  const displayLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs;

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'fill_answer':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          label: 'Evaluasi Mandiri',
          icon: FileText
        };
      case 'review_indicator':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          label: 'Reviu TPI',
          icon: CheckCircle
        };
      case 'submit_lke':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          label: 'Submit LKE',
          icon: Shield
        };
      case 'status_change':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          label: 'Status LKE',
          icon: Activity
        };
      case 'create_template':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          label: 'Buat Template',
          icon: Calendar
        };
      case 'delete_template':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          label: 'Hapus Template',
          icon: AlertCircle
        };
      case 'switch_lke':
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-800',
          label: 'Ganti Periode',
          icon: RefreshCw
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          label: 'Sistem',
          icon: History
        };
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; style: string }> = {
      admin: { label: 'Admin', style: 'bg-rose-100 text-rose-800 border-rose-200' },
      tpi: { label: 'Tim Penilai Internal (TPI)', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      ketua_tim: { label: 'Ketua Tim ZI', style: 'bg-purple-100 text-purple-800 border-purple-200' },
      ketua_pokja: { label: 'Ketua Pokja', style: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      anggota_pokja: { label: 'Anggota Pokja', style: 'bg-blue-100 text-blue-800 border-blue-200' },
      pimpinan: { label: 'Pimpinan', style: 'bg-slate-100 text-slate-800 border-slate-200' },
    };
    return roles[role] || { label: role, style: 'bg-slate-100 text-slate-600' };
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${compact ? 'p-0' : 'p-6 md:p-8'}`}>
      
      {!compact && (
        <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
              <History className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Audit Log & Jejak Akuntabilitas LKE
                {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Pemantauan real-time terhadap seluruh perubahan jawaban evaluasi, skor mandiri, serta hasil penilaian TPI secara transparan.
              </p>
            </div>
          </div>
          <button 
            onClick={() => refetch()} 
            className="self-start md:self-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Log
          </button>
        </div>
      )}

      {/* Filters (only visible if not compact, or optional) */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          {/* Search bar */}
          <div className="relative lg:col-span-5">
            <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aktor, indikator, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="lg:col-span-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800 cursor-pointer"
            >
              <option value="all">-- Semua Jenis Tindakan --</option>
              <option value="fill_answer">Evaluasi Mandiri (Pokja)</option>
              <option value="review_indicator">Penilaian & Reviu TPI</option>
              <option value="submit_lke">Pengiriman (Submit)</option>
              <option value="status_change">Perubahan Status</option>
              <option value="create_template">Duplikasi / Inisiasi Template</option>
              <option value="switch_lke">Pengalihan Periode Aktif</option>
            </select>
          </div>

          {/* Pokja Filter (Only if not filtered by a single pokjaCode prop already) */}
          <div className="lg:col-span-3">
            <select
              value={selectedPokja}
              onChange={(e) => setSelectedPokja(e.target.value)}
              disabled={!!pokjaCode}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="all">-- Semua Pokja --</option>
              <option value="1">Pokja I: Manajemen Perubahan</option>
              <option value="2">Pokja II: Penataan Tatalaksana</option>
              <option value="3">Pokja III: Penataan Sistem Manajemen SDM</option>
              <option value="4">Pokja IV: Penguatan Akuntabilitas</option>
              <option value="5">Pokja V: Penguatan Pengawasan</option>
              <option value="6">Pokja VI: Peningkatan Kualitas Pelayanan Publik</option>
            </select>
          </div>
        </div>
      )}

      {/* Log Feed */}
      <div className="space-y-4">
        {displayLogs.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-600">Tidak ada log audit ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || actionFilter !== 'all' || selectedPokja !== 'all' 
                ? 'Coba sesuaikan filter pencarian Anda.' 
                : 'Belum ada aktivitas yang tercatat untuk kriteria ini.'}
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-150 pl-5 ml-3 space-y-6">
            {displayLogs.map((log) => {
              const badge = getActionBadge(log.actionType);
              const BadgeIcon = badge.icon;
              const roleInfo = getRoleBadge(log.userRole);

              return (
                <div key={log.id} className="relative group animate-fade-in">
                  
                  {/* Timeline point indicator */}
                  <span className="absolute -left-[29px] top-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-500 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-500"></span>
                  </span>

                  {/* Log body */}
                  <div className="bg-slate-50 hover:bg-slate-100/75 border border-slate-200/60 hover:border-slate-300 p-4 rounded-xl transition duration-150 space-y-2.5 shadow-xs">
                    
                    {/* Log Header: Actor + Type + Time */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Actor user icon and name */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                          <UserIcon className="w-3.5 h-3.5 text-blue-800" />
                          <span>{log.userName}</span>
                        </div>

                        {/* Actor role */}
                        <span className={`text-[10px] font-black px-2 py-0.5 border rounded-md tracking-wide uppercase ${roleInfo.style}`}>
                          {roleInfo.label}
                        </span>

                        {/* LKE Period badge */}
                        <span className="text-[10px] bg-slate-200 border border-slate-350 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                          LKE {log.lkePeriod}
                        </span>
                      </div>

                      {/* Log Action type + Timestamp */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>

                        <span className="flex items-center gap-1 font-medium text-[11px] text-slate-500 bg-white/75 px-2 py-1 rounded-md border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Log Details Description */}
                    <div className="text-xs text-slate-700 leading-relaxed font-semibold bg-white p-3 border border-slate-250/50 rounded-lg">
                      {log.details.description}
                    </div>

                    {/* Additional info like Notes / Comments */}
                    {log.details.notes && (
                      <div className="flex items-start gap-2 text-xs bg-amber-50/50 border border-amber-200 p-2.5 rounded-lg text-amber-900">
                        <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[10px] text-amber-800 uppercase tracking-wider block">Catatan Tambahan:</span>
                          <span className="italic font-medium">"{log.details.notes}"</span>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
