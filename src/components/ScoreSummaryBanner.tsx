import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LKE, Pokja, Indicator } from '../types';
import { Download } from 'lucide-react';
import { exportLkeToPdf } from '../utils/exportPdf';

export function calculateScores(lke: LKE, user?: any) {
  let totalUnitScore = 0;
  let totalTPIScore = 0;
  let totalWeight = 0;
  let totalIndicators = 0;
  let filledIndicators = 0;

  const pokjaScores: { 
    code: string; 
    name: string; 
    weight: number; 
    unitScore: number; 
    tpiScore: number;
    filled: number;
    total: number;
  }[] = [];

  if (!lke || !lke.pokjas) {
    return {
      totalUnitScore,
      totalTPIScore,
      totalWeight,
      percentage: 0,
      tpiPercentage: 0,
      totalIndicators,
      filledIndicators,
      progressPercent: 0,
      pokjaScores
    };
  }

  const isRestricted = user && (user.role === 'ketua_pokja' || user.role === 'anggota_pokja');

  lke.pokjas.forEach((pokja: Pokja) => {
    // If restricted, only include their assigned pokja
    if (isRestricted && !user.assigned_pokja?.includes(pokja.code)) {
      return;
    }

    let pUnitScore = 0;
    let pTPIScore = 0;
    let pFilled = 0;
    const pTotal = pokja.indicators.length;

    // Calculate sum of all indicator weights in this Pokja for scaling
    const pIndicatorWeightSum = pokja.indicators.reduce((sum, ind) => sum + ind.weight, 0);

    pokja.indicators.forEach((ind: Indicator) => {
      totalIndicators++;
      if (ind.selected_option_id) {
        filledIndicators++;
        pFilled++;
        const opt = ind.options.find(o => o.id === ind.selected_option_id);
        if (opt) {
          pUnitScore += ind.weight * (opt.score_percentage / 100);
        }
      }

      // TPI score: default to unit score if not reviewed, or if it is currently in 'filled' status (correction)
      const tpiOptionId = (ind.status === 'reviewed_accepted' || ind.status === 'reviewed_revision_required')
        ? (ind.reviewed_option_id || ind.selected_option_id)
        : ind.selected_option_id;

      if (tpiOptionId) {
        const opt = ind.options.find(o => o.id === tpiOptionId);
        if (opt) {
          pTPIScore += ind.weight * (opt.score_percentage / 100);
        }
      }
    });

    // Scale to Pokja Weight
    const scaledUnitScore = pIndicatorWeightSum > 0 ? (pUnitScore / pIndicatorWeightSum) * pokja.weight : 0;
    const scaledTPIScore = pIndicatorWeightSum > 0 ? (pTPIScore / pIndicatorWeightSum) * pokja.weight : 0;

    totalUnitScore += scaledUnitScore;
    totalTPIScore += scaledTPIScore;
    totalWeight += pokja.weight;

    pokjaScores.push({
      code: pokja.code,
      name: pokja.name,
      weight: pokja.weight,
      unitScore: scaledUnitScore,
      tpiScore: scaledTPIScore,
      filled: pFilled,
      total: pTotal
    });
  });

  const percentage = totalWeight > 0 ? (totalUnitScore / totalWeight) * 100 : 0;
  const tpiPercentage = totalWeight > 0 ? (totalTPIScore / totalWeight) * 100 : 0;
  const progressPercent = totalIndicators > 0 ? Math.round((filledIndicators / totalIndicators) * 100) : 0;

  return {
    totalUnitScore,
    totalTPIScore,
    totalWeight,
    percentage,
    tpiPercentage,
    totalIndicators,
    filledIndicators,
    progressPercent,
    pokjaScores
  };
}

export function ScoreSummaryBanner() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then(res => res.json())
  });

  const { data: lke } = useQuery<LKE>({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  if (!user || !lke) return null;

  const stats = calculateScores(lke, user);

  return (
    <div className="bg-white text-slate-900 rounded-xl shadow-sm p-6 md:p-8 border-2 border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Section: Main Big Score */}
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs md:text-sm font-bold px-3 py-1 rounded tracking-wide uppercase">
              ⚡ LIVE REAL-TIME CALCULATION (SCALED)
            </span>
            <span className="text-slate-500 text-xs md:text-sm font-bold">
              Target Maksimal LKE: {stats.totalWeight.toFixed(1)} Poin
            </span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Unit Kerja Score Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                NILAI MANDIRI UNIT KERJA
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {stats.totalUnitScore.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {stats.totalWeight.toFixed(2)}
                </span>
                <span className="ml-auto bg-emerald-600 text-white font-extrabold text-xs px-2 py-1 rounded">
                  {stats.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hasil penilaian mandiri secara real-time berdasarkan jawaban yang diisi oleh Pokja.
              </p>
            </div>

            {/* TPI Score Box */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl relative overflow-hidden">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                NILAI EVALUASI TPI
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl md:text-4xl font-black text-blue-900">
                  {stats.totalTPIScore.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-blue-400">
                  / {stats.totalWeight.toFixed(2)}
                </span>
                <span className="ml-auto bg-blue-600 text-white font-extrabold text-xs px-2 py-1 rounded">
                  {stats.tpiPercentage.toFixed(1)}%
                </span>
              </div>
              
              {/* WBK/WBBM Prediction Logic */}
              <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase">Prediksi Kelulusan:</span>
                {stats.totalTPIScore >= 85 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">
                    MEMENUHI WBBM 🌟
                  </span>
                ) : stats.totalTPIScore >= 75 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                    MEMENUHI WBK ✨
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-600 border border-slate-300">
                    BELUM MEMENUHI GRADE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Progress Indicators & TPI Status */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200 min-w-[280px] justify-center">
          <div>
            <div className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-2">
              <span>PROGRESS PENGISIAN</span>
              <span>{stats.filledIndicators} / {stats.totalIndicators} ({stats.progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border border-slate-300">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs md:text-sm">
            <span className="text-slate-600 font-bold">Status Evaluasi:</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {lke.status}
            </span>
          </div>

          <button
            onClick={() => exportLkeToPdf(lke)}
            className="w-full text-xs font-bold text-center py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-1 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Cetak Laporan PDF 📄
          </button>
        </div>

      </div>

      {/* Pokja Breakdown Pills */}
      <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.pokjaScores.map((p) => (
          <div 
            key={p.code} 
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <div className="text-xs text-slate-500 font-extrabold uppercase truncate">
              Pokja {p.code}
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-sm font-bold text-slate-700 flex justify-between px-1 bg-white rounded border border-slate-100 py-0.5">
                <span>Mandiri:</span>
                <span className="font-extrabold text-slate-950">{p.unitScore.toFixed(2)}</span>
              </div>
              <div className="text-sm font-bold text-blue-700 flex justify-between px-1 bg-blue-50/50 rounded border border-blue-100/50 py-0.5">
                <span>TPI:</span>
                <span className="font-extrabold text-blue-900">{p.tpiScore.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-bold mt-2 pt-1 border-t border-slate-100 flex justify-between">
              <span>Bobot</span>
              <span>{p.weight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
