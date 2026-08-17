import React, { useState } from 'react';
import { AlertCircle, Plus, CheckCircle2, MessageSquare, HelpCircle, X, Clock } from 'lucide-react';

type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
type ReportCategory = 'pelayanan_buruk' | 'saran_masukan' | 'infrastruktur' | 'pungli' | 'lainnya';

interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  date: string;
  status: ReportStatus;
  reporter?: string; // Optional if anonymous
}

const mockReports: Report[] = [
  {
    id: 'RPT-2023-001',
    title: 'Saran Penambahan Kursi Ruang Tunggu',
    description: 'Mohon untuk ditambah kursi di ruang tunggu loket pendaftaran, karena saat jam sibuk banyak yang berdiri.',
    category: 'saran_masukan',
    date: '2023-10-12T10:30:00Z',
    status: 'resolved',
  },
  {
    id: 'RPT-2023-002',
    title: 'AC di Ruang Pelayanan Kurang Dingin',
    description: 'Pendingin ruangan di area loket pengambilan berkas sepertinya rusak, sangat panas di siang hari.',
    category: 'infrastruktur',
    date: '2023-11-05T09:15:00Z',
    status: 'in_progress',
  },
  {
    id: 'RPT-2023-003',
    title: 'Pelayanan Sangat Lambat',
    description: 'Petugas loket sering kosong pada jam kerja, mengakibatkan antrean panjang.',
    category: 'pelayanan_buruk',
    date: '2023-12-01T14:45:00Z',
    status: 'pending',
  }
];

export function Reporting() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('saran_masukan');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const getStatusBadge = (status: ReportStatus) => {
    switch(status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Menunggu Review</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><HelpCircle className="w-3.5 h-3.5" /> Sedang Diproses</span>;
      case 'resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai / Ditindaklanjuti</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300"><X className="w-3.5 h-3.5" /> Ditolak / Tidak Valid</span>;
    }
  };

  const getCategoryLabel = (cat: ReportCategory) => {
    switch(cat) {
      case 'saran_masukan': return 'Saran & Masukan';
      case 'infrastruktur': return 'Infrastruktur & Fasilitas';
      case 'pungli': return 'Pungli / Pelanggaran';
      case 'pelayanan_buruk': return 'Pelayanan Publik';
      case 'lainnya': return 'Lainnya';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newReport: Report = {
        id: `RPT-2024-${String(reports.length + 1).padStart(3, '0')}`,
        title,
        description,
        category,
        date: new Date().toISOString(),
        status: 'pending',
        reporter: isAnonymous ? 'Anonim' : 'Masyarakat / Pengguna',
      };
      
      setReports([newReport, ...reports]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('saran_masukan');
      setIsAnonymous(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Layanan Aspirasi & Pengaduan</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Sampaikan saran, masukan, maupun laporan terkait pelayanan publik.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800">Daftar Aspirasi & Laporan Masuk</h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
            {reports.length} Laporan
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      {getCategoryLabel(report.category)}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                    {report.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-left md:text-right text-xs font-medium text-slate-500 space-y-1">
                  <div>
                    Dilaporkan pada:<br />
                    <strong className="text-slate-700">{new Date(report.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                  <div>
                    Pelapor: <strong className="text-slate-700">{report.reporter || 'Anonim'}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Buat Laporan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">Form Aspirasi & Pengaduan</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Judul Laporan / Saran</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  placeholder="Singkat dan jelas (Contoh: Pelayanan di Loket 2 Lambat)"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Kategori</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium bg-white"
                >
                  <option value="saran_masukan">Saran & Masukan</option>
                  <option value="pelayanan_buruk">Pengaduan Pelayanan Publik</option>
                  <option value="infrastruktur">Fasilitas & Infrastruktur</option>
                  <option value="pungli">Indikasi Pelanggaran / Pungli</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Deskripsi Lengkap</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium resize-none"
                  placeholder="Ceritakan detail keluhan atau saran Anda di sini..."
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsAnonymous(!isAnonymous)}>
                <input 
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-sm text-slate-800">Kirim Secara Anonim</div>
                  <div className="text-xs font-medium text-slate-500">Centang ini jika Anda ingin menyembunyikan identitas Anda pada laporan publik.</div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    'Kirim'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
