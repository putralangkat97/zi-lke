import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';
import { exportLkeToPdf } from '../utils/exportPdf';

export function LkeDetail() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then(res => res.json())
  });

  const { data: lke } = useQuery({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  const submitMutation = useMutation({
    mutationFn: () => fetch('/api/lkes/active/submit', { method: 'PUT' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => fetch('/api/lkes/active/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  if (!user || !lke || !lke.pokjas) return <div>Loading...</div>;

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lembar Kerja Evaluasi (LKE): {lke.unit_name}</h2>
          <p className="text-slate-600 text-sm mt-1">Periode: <span className="font-semibold">{lke.period}</span> | Status Saat Ini: <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{lke.status}</span></p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button 
            size="lg"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
            onClick={() => exportLkeToPdf(lke)}
          >
            <Download className="w-5 h-5 text-slate-500" />
            Unduh Laporan (PDF) 📄
          </Button>

          {user.role === 'ketua_tim' && lke.status === 'Draft' && (
             <Button 
               size="lg"
               onClick={() => {
                 if (confirm("Apakah Anda yakin ingin submit LKE ini ke TPI? Setelah disubmit, Pokja tidak dapat mengubah jawaban.")) {
                   submitMutation.mutate();
                 }
               }}
               disabled={submitMutation.isPending}
             >
               {submitMutation.isPending ? 'Menyimpan...' : 'Submit ke TPI 🚀'}
             </Button>
          )}

          {user.role === 'ketua_tim' && lke.status === 'Need Revision' && (
             <Button 
               size="lg"
               onClick={() => {
                 if (confirm("Apakah Anda yakin ingin mensubmit kembali perbaikan LKE ini ke TPI?")) {
                   submitMutation.mutate();
                 }
               }}
               disabled={submitMutation.isPending}
             >
               {submitMutation.isPending ? 'Menyimpan...' : 'Submit Perbaikan ke TPI 🚀'}
             </Button>
          )}

          {user.role === 'tpi' && (lke.status === 'Submitted' || lke.status === 'In Review') && (
             <>
               <Button 
                 size="lg"
                 variant="outline"
                 className="border-amber-600 text-amber-700 hover:bg-amber-50 font-bold"
                 onClick={() => {
                   if (confirm("Kirim kembali ke Unit Kerja untuk dilakukan revisi/perbaikan?")) {
                     statusMutation.mutate('Need Revision');
                   }
                 }}
                 disabled={statusMutation.isPending}
               >
                 Kembalikan untuk Revisi ⚠️
               </Button>
               <Button 
                 size="lg"
                 className="bg-green-600 hover:bg-green-700 text-white font-bold"
                 onClick={() => {
                   if (confirm("Setujui LKE ini dan beri status Approved?")) {
                     statusMutation.mutate('Approved');
                   }
                 }}
                 disabled={statusMutation.isPending}
               >
                 Setujui LKE (Approved) ✓
               </Button>
             </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Daftar Pokja Area Pengungkit</h3>
        <div className="grid gap-4">
          {lke.pokjas.map((pokja: any) => {
            if ((user.role === 'ketua_pokja' || user.role === 'anggota_pokja') && !user.assigned_pokja?.includes(pokja.code)) {
              return null;
            }

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
                cardClass: "border-2 border-red-500 hover:border-red-600 shadow-sm transition-all duration-150",
                badge: (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200">
                    Belum Diisi ❌
                  </span>
                )
              },
              pemeriksaan: {
                cardClass: "border-2 border-amber-500 hover:border-amber-600 shadow-sm transition-all duration-150",
                badge: (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    Pemeriksaan / Revisi ⚠️
                  </span>
                )
              },
              ok: {
                cardClass: "border-2 border-emerald-500 hover:border-emerald-600 shadow-sm transition-all duration-150",
                badge: (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sudah OK ✓ ❇️
                  </span>
                )
              }
            };

            const currentConfig = statusConfig[statusType];

            return (
              <Card key={pokja.code} className={currentConfig.cardClass}>
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-extrabold text-slate-900">Pokja {pokja.code}: {pokja.name}</h4>
                      {currentConfig.badge}
                    </div>
                    <div className="text-sm text-slate-600 flex flex-wrap gap-4 pt-1">
                      <span className="font-medium">Bobot: <strong className="text-slate-900">{pokja.weight}</strong></span>
                      <span>Progress Terisi: <strong className="text-slate-900">{pokja.progress.filled}/{pokja.progress.total}</strong></span>
                      {pokja.progress.revision_required > 0 && (
                        <span className="text-amber-600 font-bold">Revisi: {pokja.progress.revision_required}</span>
                      )}
                    </div>
                  </div>
                  <Link to="/pokja/$pokjaCode" params={{ pokjaCode: pokja.code }} className="print:hidden">
                    <Button variant="outline" size="lg" className="w-full md:w-auto font-bold border-blue-600 text-blue-700 hover:bg-blue-50">
                      Buka Area Pokja &rarr;
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

