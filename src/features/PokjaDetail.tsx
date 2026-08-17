import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EvidenceManager } from '../components/EvidenceManager';

export function PokjaDetail() {
  const { pokjaCode } = useParams({ strict: false });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then(res => res.json())
  });

  const { data: lke } = useQuery({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  const answerMutation = useMutation({
    mutationFn: (data: { indicatorId: string; selected_option_id?: string; answer_notes?: string }) => 
      fetch(`/api/lkes/active/indicators/${data.indicatorId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { 
      indicatorId: string; 
      reviewed_option_id?: string; 
      review_notes?: string; 
      status: 'reviewed_accepted' | 'reviewed_revision_required' 
    }) => 
      fetch(`/api/lkes/active/indicators/${data.indicatorId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => 
      fetch(`/api/lkes/active/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  if (!user || !lke || !lke.pokjas) return <div>Loading...</div>;

  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const toggleLogs = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pokja = lke.pokjas.find((p: any) => p.code === pokjaCode);
  if (!pokja) return <div>Pokja tidak ditemukan</div>;

  const isRestrictedPokja = (user.role === 'ketua_pokja' || user.role === 'anggota_pokja');
  const hasAccessToPokja = !isRestrictedPokja || user.assigned_pokja?.includes(pokjaCode);

  if (!hasAccessToPokja) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-900 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="text-4xl">🚫</div>
        <h3 className="text-xl font-bold">Akses Ditolak</h3>
        <p className="text-slate-600 font-medium">
          Sebagai anggota/ketua {user.assigned_pokja?.map((c: string) => `Pokja ${c}`).join(', ')}, Anda tidak diperkenankan untuk melihat atau mengubah data milik Pokja {pokjaCode}.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="outline" className="border-red-300 text-red-800 hover:bg-red-100 font-bold">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isEditable = (user.role === 'ketua_pokja' || user.role === 'anggota_pokja') && 
                     user.assigned_pokja?.includes(pokjaCode) &&
                     (lke.status === 'Draft' || lke.status === 'Need Revision');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Link to="/lke">
            <Button variant="outline" size="lg" className="font-bold border-slate-300 text-slate-700">Kembali</Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pokja {pokja.code}: {pokja.name}</h2>
            <p className="text-slate-600 text-sm font-medium">Bobot Total Area: <span className="font-bold text-slate-900">{pokja.weight}</span></p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pokja.indicators.map((ind: any) => (
          <Card key={ind.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-none">
                  <div className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md">
                    {ind.code}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{ind.question}</h4>
                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                      <span>Bobot: {ind.weight}</span>
                      <span>Status: <span className="font-medium">{ind.status}</span></span>
                      {ind.last_editor && <span>Terakhir diubah: {ind.last_editor}</span>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Pilihan Jawaban & Kriteria Nilai:
                      </div>
                      <div className="grid gap-2">
                        {ind.options.map((opt: any) => {
                          const isSelected = ind.selected_option_id === opt.id;
                          return (
                            <label 
                              key={opt.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-blue-900 font-medium' 
                                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={`answer-${ind.id}`} 
                                value={opt.id}
                                checked={isSelected}
                                onChange={() => {
                                  if (isEditable) {
                                    answerMutation.mutate({ 
                                      indicatorId: ind.id, 
                                      selected_option_id: opt.id,
                                      answer_notes: ind.answer_notes
                                    });
                                  }
                                }}
                                disabled={!isEditable || answerMutation.isPending}
                                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {opt.label}
                                  </span>
                                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                                    {opt.score_percentage}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {opt.criteria}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-medium text-gray-700">Catatan/Keterangan Unit</label>
                      <textarea 
                        className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border"
                        rows={3}
                        placeholder="Tuliskan keterangan atas jawaban..."
                        defaultValue={ind.answer_notes || ""}
                        onBlur={(e) => {
                          if (isEditable && e.target.value !== ind.answer_notes) {
                             answerMutation.mutate({ 
                               indicatorId: ind.id, 
                               selected_option_id: ind.selected_option_id,
                               answer_notes: e.target.value 
                             });
                          }
                        }}
                        disabled={!isEditable || answerMutation.isPending}
                      />
                    </div>

                    <EvidenceManager 
                      indicator={ind} 
                      isEditable={isEditable} 
                      lkeId={lke.id} 
                    />
                                      {(user.role === 'tpi' || ind.status === 'reviewed_revision_required' || ind.status === 'reviewed_accepted') && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="text-sm font-bold text-gray-900 mb-4">Reviu TPI</h5>
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Jawaban TPI</label>
                             <select 
                               className="w-full text-sm border-gray-300 rounded-md shadow-sm border p-2"
                               value={ind.reviewed_option_id || ''}
                               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                  if (user.role === 'tpi') {
                                    reviewMutation.mutate({
                                      indicatorId: ind.id,
                                      reviewed_option_id: e.target.value || undefined,
                                      review_notes: ind.review_notes,
                                      status: ind.status === 'reviewed_revision_required' ? 'reviewed_revision_required' : 'reviewed_accepted'
                                    });
                                  }
                               }}
                               disabled={user.role !== 'tpi'}
                             >
                               <option value="">Pilih Jawaban TPI...</option>
                               {ind.options.map((opt: any) => (
                                 <option key={opt.id} value={opt.id}>{opt.label}</option>
                               ))}
                             </select>
                           </div>
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Keputusan Validasi</label>
                             <div className="flex gap-4">
                               <label className="flex items-center gap-2 text-sm cursor-pointer font-bold text-emerald-700">
                                 <input 
                                   type="radio" 
                                   name={`keputusan-${ind.id}`} 
                                   value="reviewed_accepted" 
                                   checked={ind.status === 'reviewed_accepted'}
                                   onChange={() => {
                                     if (user.role === 'tpi') {
                                       reviewMutation.mutate({
                                         indicatorId: ind.id,
                                         reviewed_option_id: ind.reviewed_option_id,
                                         review_notes: ind.review_notes,
                                         status: 'reviewed_accepted'
                                       });
                                     }
                                   }}
                                   disabled={user.role !== 'tpi'} 
                                 /> Disetujui ✓
                               </label>
                               <label className="flex items-center gap-2 text-sm cursor-pointer font-bold text-amber-700">
                                 <input 
                                   type="radio" 
                                   name={`keputusan-${ind.id}`} 
                                   value="reviewed_revision_required" 
                                   checked={ind.status === 'reviewed_revision_required'}
                                   onChange={() => {
                                     if (user.role === 'tpi') {
                                       reviewMutation.mutate({
                                         indicatorId: ind.id,
                                         reviewed_option_id: ind.reviewed_option_id,
                                         review_notes: ind.review_notes,
                                         status: 'reviewed_revision_required'
                                       });
                                     }
                                   }}
                                   disabled={user.role !== 'tpi'} 
                                 /> Ditolak dengan Catatan ⚠️
                               </label>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Catatan Revisi / Feedback Loop</label>
                             <textarea 
                               className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2 border"
                               rows={3}
                               placeholder="Tulis instruksi revisi spesifik (misal: 'Foto dokumentasi kurang' atau 'Daftar hadir belum ditandatangani')..."
                               defaultValue={ind.review_notes || ""}
                               onBlur={(e) => {
                                 if (user.role === 'tpi' && e.target.value !== ind.review_notes) {
                                   reviewMutation.mutate({
                                     indicatorId: ind.id,
                                     reviewed_option_id: ind.reviewed_option_id,
                                     review_notes: e.target.value,
                                     status: ind.status === 'reviewed_revision_required' ? 'reviewed_revision_required' : 'reviewed_accepted'
                                   });
                                 }
                               }}
                               disabled={user.role !== 'tpi'}
                             />
                           </div>
                           {user.role === 'tpi' && (
                             <div className="flex items-center gap-3 pt-2">
                               <Button 
                                 size="sm" 
                                 disabled={reviewMutation.isPending}
                                 onClick={() => {
                                   alert('Seluruh perubahan reviu disimpan secara otomatis dan real-time.');
                                 }}
                               >
                                 {reviewMutation.isPending ? 'Menyimpan...' : 'Reviu Tersimpan ✓'}
                               </Button>
                               {reviewMutation.isPending && (
                                 <span className="text-xs text-blue-600 animate-pulse font-medium">Menyimpan reviu ke LKE...</span>
                               )}
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
