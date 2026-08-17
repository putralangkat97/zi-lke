import React, { useState, useEffect } from 'react';
import { Outlet, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UserSwitcher } from './UserSwitcher';
import { Plus, Calendar, Building, Check, AlertCircle, X, Shield, ArrowRight, Eye, HelpCircle, ZoomIn } from 'lucide-react';
import { LKE } from '../types';

function AppShellContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Accessibility & Elder-Friendly States
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // Selalu set ukuran huruf ke Besar (19px) agar sangat ramah lansia secara default
    document.documentElement.style.fontSize = '19px';
  }, []);

  // 1. Fetch current active LKE
  const { data: lke } = useQuery<LKE>({
    queryKey: ['lke', 'active'],
    queryFn: () => fetch('/api/lkes/active').then(res => res.json())
  });

  // 2. Fetch list of all LKE collections
  const { data: lkesList } = useQuery<LKE[]>({
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
      setSuccessToast('Berhasil beralih periode LKE! 🔄');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  });

  // Mutation to create a new LKE template
  const createLkeMutation = useMutation({
    mutationFn: (data: { period: string; unit_name: string }) =>
      fetch('/api/lkes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (newLke) => {
      queryClient.invalidateQueries();
      setIsCreateOpen(false);
      setNewPeriod('');
      setNewUnitName('');
      setSuccessToast(`Template LKE Baru Tahun ${newLke.period} Berhasil Dibuat dan Diaktifkan! 🚀`);
      setTimeout(() => setSuccessToast(null), 5000);
    },
    onError: (err) => {
      setErrorMsg('Gagal membuat template baru. Silakan coba lagi.');
    }
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    const yearNum = parseInt(newPeriod, 10);
    if (!newPeriod || isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      setErrorMsg('Tahun LKE harus berupa angka tahun yang valid (2020 - 2100).');
      return;
    }

    // Check if period already exists
    if (lkesList?.some(l => l.period === newPeriod)) {
      setErrorMsg(`Template LKE untuk periode tahun ${newPeriod} sudah ada.`);
      return;
    }

    createLkeMutation.mutate({
      period: newPeriod,
      unit_name: newUnitName.trim() || lke?.unit_name || 'Kantor Pertanahan Kota Binjai'
    });
  };

  const hasAdminPrivilege = user?.role === 'admin' || user?.role === 'tpi';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased text-base">
      
      {/* Bar Aksesibilitas (High Contrast / Low Vision) */}
      <div className="bg-slate-950 text-white py-2 px-6 border-b border-slate-800 text-xs font-bold print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4.5 h-4.5 text-amber-400" />
            <span className="text-slate-200">Mode Aksesibilitas (Ukuran Huruf Besar) 👓</span>
          </div>
          
          <div>
            {/* Help / Guide button */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer border border-blue-500 font-extrabold shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Panduan Mudah Baca LKE 📖</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Panduan Aksesibilitas */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-blue-900 max-w-2xl w-full overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-amber-400 stroke-[2.5]" />
                <h3 className="font-black text-xl md:text-2xl tracking-tight">Panduan Mudah Penggunaan Aplikasi LKE</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="text-white hover:text-amber-400 transition bg-blue-950 p-1.5 rounded-lg border border-blue-800 cursor-pointer"
                title="Tutup Panduan"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Content with Large, High-Contrast Text */}
            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto leading-relaxed">
              <p className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3">
                Selamat datang Bapak/Ibu Evaluator dan Anggota Tim Kerja Zona Integritas. Berikut adalah cara mudah membaca dan menggunakan aplikasi ini:
              </p>

              <div className="space-y-5 text-sm md:text-base">
                {/* Point 1 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-900 flex items-center justify-center font-black text-base">
                    1
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Membaca Nilai & Skor (Bagian Atas)</h4>
                    <p className="text-slate-600 font-medium mt-1">
                      Di halaman utama (Dashboard), kami menampilkan grafik nilai yang sangat besar. Warna <span className="text-indigo-800 font-extrabold">Biru Tua</span> menunjukkan nilai evaluasi mandiri Anda, dan warna <span className="text-emerald-800 font-extrabold">Hijau</span> menunjukkan nilai yang disetujui Tim Penilai Internal (TPI).
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-900 flex items-center justify-center font-black text-base">
                    2
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Melihat Menu dengan Tab Sederhana</h4>
                    <p className="text-slate-600 font-medium mt-1">
                      Gunakan tombol tab besar abu-abu di bawah grafik untuk berpindah antara:
                    </p>
                    <ul className="list-disc list-inside pl-4 mt-1.5 text-slate-600 space-y-1 font-semibold">
                      <li><strong>Overview Pokja:</strong> Melihat perkembangan pengerjaan 6 Area Pokja.</li>
                      <li><strong>Manajemen Periode:</strong> Membuat template evaluasi baru (khusus Admin).</li>
                      <li><strong>Log Audit:</strong> Melihat catatan riwayat pengisian data secara transparan.</li>
                    </ul>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-900 flex items-center justify-center font-black text-base">
                    3
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Mengisi Lembar Kerja LKE</h4>
                    <p className="text-slate-600 font-medium mt-1">
                      Klik menu <strong>📋 Lembar Kerja (LKE)</strong> di baris navigasi atas. Di sana, Bapak/Ibu cukup mengklik nama Pokja, lalu memilih jawaban pilihan ganda bulat-bulat yang sudah tersedia. Jangan lupa mengunggah dokumen bukti dukung pada kolom yang disediakan.
                    </p>
                  </div>
                </div>

                {/* Point 4 */}
                <div className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-900 flex items-center justify-center font-black text-base">
                    4
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Butuh Bantuan Membaca Tulisan?</h4>
                    <p className="text-slate-600 font-medium mt-1">
                      Gunakan tombol ukuran huruf di pojok kanan atas layar Anda (<strong>A+</strong> atau <strong>A++</strong>) untuk memperbesar seluruh tulisan di website ini agar lebih nyaman dibaca tanpa kacamata.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-extrabold rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
                >
                  Tutup dan Lanjutkan Membaca 🚀
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Dynamic Success Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-bounce bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500">
          <Check className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Notifikasi Sistem</p>
            <p className="text-sm opacity-95">{successToast}</p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="ml-auto hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Header - High contrast and spacious */}
      <header className="bg-blue-900 text-white shadow-md border-b-4 border-blue-700 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
              LKE ZONA INTEGRITAS
            </h1>
            <p className="text-blue-200 text-sm md:text-base font-medium">
              {lke ? `${lke.unit_name} — Periode LKE ${lke.period}` : 'Kantor Pertanahan Kota Binjai — MenPANRB 2026'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year/LKE Selector Dropdown */}
            {lkesList && lkesList.length > 0 && (
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-wider text-blue-300 font-bold mb-1">
                  Pilih Periode Aktif
                </label>
                <select
                  value={lke?.id || ''}
                  onChange={(e) => switchLkeMutation.mutate(e.target.value)}
                  className="bg-blue-950/80 text-white border border-blue-700 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  {lkesList.map((item) => (
                    <option key={item.id} value={item.id} className="bg-blue-950 text-white">
                      LKE {item.period} ({item.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Status & Dev Switcher */}
            <div className="flex items-center gap-4 bg-blue-950/60 p-3 rounded-lg border border-blue-800">
              <div className="text-right">
                <div className="text-sm font-bold text-white">{user?.name || 'Loading...'}</div>
                <div className="text-xs text-blue-300 font-medium">
                  Role: <span className="uppercase text-amber-300 font-bold">{user?.role}</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-amber-400 text-blue-950 rounded-full flex items-center justify-center font-extrabold text-lg shadow">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar - Big buttons */}
        <div className="bg-blue-950 px-6 border-t border-blue-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-2 flex-wrap gap-2">
            <nav className="flex items-center space-x-2">
              <Link 
                to="/" 
                className="px-5 py-3 rounded-md text-base font-bold text-blue-100 hover:text-white hover:bg-blue-800 transition-colors [&.active]:bg-blue-600 [&.active]:text-white [&.active]:shadow"
              >
                🏠 Dashboard
              </Link>
              <Link 
                to="/lke" 
                className="px-5 py-3 rounded-md text-base font-bold text-blue-100 hover:text-white hover:bg-blue-800 transition-colors [&.active]:bg-blue-600 [&.active]:text-white [&.active]:shadow"
              >
                📋 Lembar Kerja (LKE)
              </Link>
              <Link 
                to="/audit" 
                className="px-5 py-3 rounded-md text-base font-bold text-blue-100 hover:text-white hover:bg-blue-800 transition-colors [&.active]:bg-blue-600 [&.active]:text-white [&.active]:shadow"
              >
                🛡️ Jejak Audit (Log)
              </Link>
              <Link 
                to="/pelaporan" 
                className="px-5 py-3 rounded-md text-base font-bold text-blue-100 hover:text-white hover:bg-blue-800 transition-colors [&.active]:bg-red-600 [&.active]:text-white [&.active]:shadow"
              >
                📢 Pelaporan
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/users" 
                  className="px-5 py-3 rounded-md text-base font-bold text-blue-100 hover:text-white hover:bg-blue-800 transition-colors [&.active]:bg-blue-600 [&.active]:text-white [&.active]:shadow"
                >
                  👥 Pengguna
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* ADMIN TEMPLATE BUILDER BUTTON */}
              {hasAdminPrivilege && (
                <button
                  onClick={() => {
                    setNewUnitName(lke?.unit_name || '');
                    setNewPeriod('');
                    setErrorMsg(null);
                    setIsCreateOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm shadow transition duration-150 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                  Buat Template Baru 🛠️
                </button>
              )}

              {/* Dev Switcher embedded neatly */}
              <div className="py-1">
                <UserSwitcher currentUser={user} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Generous spacing and readable max-width */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Dynamic header reminder if viewing older or draft LKE */}
        {lke && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-r-xl flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm">
                Anda saat ini mengakses evaluasi <span className="font-bold">LKE Periode Tahun {lke.period}</span> untuk unit <span className="font-bold">{lke.unit_name}</span>. Status LKE: <span className="font-extrabold underline">{lke.status}</span>.
              </p>
            </div>
          </div>
        )}

        <Outlet />
      </main>

      {/* Interactive Form Modal for Creating Template (Tahun 2027 dsb.) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-lg">Inisiasi Template LKE Baru</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white transition duration-150"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleCreateTemplate} className="p-6 space-y-5">
              
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Aturan Pembuatan Template Baru:
                </div>
                <p className="leading-relaxed pl-5">
                  Sistem akan menduplikasi struktur indikator LKE utama dan seluruh 6 Area Pengungkit Pokja, kemudian membersihkan (reset) seluruh pilihan jawaban, unggahan berkas, tautan bukti, nilai evaluasi, dan catatan reviu agar siap diisi kembali secara fresh untuk tahun yang dipilih (misalnya 2027 atau ke depan).
                </p>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Input: Period Year */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Target Tahun Evaluasi LKE <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    placeholder="Contoh: 2027"
                    required
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800 bg-slate-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Masukkan tahun rencana evaluasi Zona Integritas selanjutnya (misal: 2027, 2028).
                </p>
              </div>

              {/* Input: Unit Kerja Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Nama Satuan Kerja / Unit Kerja <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Kantor Pertanahan Kota Binjai"
                    required
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800 bg-slate-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Identitas instansi yang akan dievaluasi pada periode LKE ini.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLkeMutation.isPending}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition flex items-center gap-1.5 shadow"
                >
                  {createLkeMutation.isPending ? 'Memproses...' : 'Buat & Aktifkan Template 🚀'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          Aplikasi LKE Zona Integritas &copy; 2026 — {lke?.unit_name || 'Kantor Pertanahan Kota Binjai'}
        </div>
      </footer>
    </div>
  );
}

export function AppShell() {
  return (
    <AuthProvider>
      <AppShellContent />
    </AuthProvider>
  );
}
