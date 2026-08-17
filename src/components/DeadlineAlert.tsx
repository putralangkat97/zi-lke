import React, { useState, useEffect } from 'react';
import { CalendarClock, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function DeadlineAlert({ targetDateString = '2026-11-30' }: { targetDateString?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, isPassed: boolean, isApproaching: boolean }>({
    days: 0,
    isPassed: false,
    isApproaching: false
  });

  useEffect(() => {
    // In a real app, targetDateString would come from LKE API.
    // We are mocking it here for demo purposes if not provided.
    const target = new Date(targetDateString);
    const today = new Date();
    
    // Set time to midnight for accurate day comparison
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setTimeLeft({
      days: Math.abs(diffDays),
      isPassed: diffDays < 0,
      isApproaching: diffDays >= 0 && diffDays <= 14 // 14 days warning threshold
    });
  }, [targetDateString]);

  let alertConfig = {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-800',
    title: 'Waktu Masih Panjang',
    desc: `Tenggat waktu pengisian LKE masih aman (${timeLeft.days} hari lagi).`,
    Icon: CheckCircle
  };

  if (timeLeft.isPassed) {
    alertConfig = {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      title: 'Tenggat Waktu Terlewat!',
      desc: `Batas akhir penyelesaian LKE telah lewat ${timeLeft.days} hari yang lalu. Segera kumpulkan!`,
      Icon: AlertTriangle
    };
  } else if (timeLeft.isApproaching) {
    alertConfig = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      title: 'Peringatan Tenggat Waktu!',
      desc: `Sisa waktu penyelesaian LKE tinggal ${timeLeft.days} hari lagi. Harap segera lengkapi evidence.`,
      Icon: Clock
    };
  }

  const { Icon } = alertConfig;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${alertConfig.bg} ${alertConfig.border} shadow-sm animate-fade-in`}>
      <div className={`p-2 bg-white rounded-lg border ${alertConfig.border} shadow-sm`}>
        <Icon className={`w-6 h-6 ${alertConfig.iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <h4 className={`text-sm font-extrabold tracking-tight ${alertConfig.textColor}`}>
            {alertConfig.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CalendarClock className="w-3.5 h-3.5" />
            Target: {new Date(targetDateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <p className={`text-sm mt-1 font-medium ${alertConfig.textColor} opacity-90`}>
          {alertConfig.desc}
        </p>
      </div>
    </div>
  );
}
