import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadCloud, 
  FileText, 
  Link2, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Calendar, 
  User, 
  Download, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { Button } from './ui/Button';

interface EvidenceDoc {
  id: string;
  name: string;
  url: string;
  size?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface EvidenceLink {
  id: string;
  url: string;
}

interface Indicator {
  id: string;
  code: string;
  question: string;
  evidence_documents?: EvidenceDoc[];
  evidence_links?: EvidenceLink[];
}

interface EvidenceManagerProps {
  indicator: Indicator;
  isEditable: boolean;
  lkeId: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimestamp = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function EvidenceManager({ indicator, isEditable, lkeId }: EvidenceManagerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string; size: string; progress: number }[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);

  // Mutations
  const uploadDocMutation = useMutation({
    mutationFn: (data: { name: string; size: string }) =>
      fetch(`/api/lkes/${lkeId}/indicators/${indicator.id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) =>
      fetch(`/api/lkes/${lkeId}/indicators/${indicator.id}/evidence/${docId}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  const addLinkMutation = useMutation({
    mutationFn: (url: string) =>
      fetch(`/api/lkes/${lkeId}/indicators/${indicator.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) =>
      fetch(`/api/lkes/${lkeId}/indicators/${indicator.id}/links/${linkId}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lke', 'active'] });
    }
  });

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditable) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isEditable) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const sizeStr = formatFileSize(file.size);
      const taggedName = autoTagEnabled ? `[${indicator.code}] ${file.name}` : file.name;
      
      const newUpload = {
        id: uploadId,
        name: taggedName,
        size: sizeStr,
        progress: 0,
      };

      setUploadingFiles(prev => [...prev, newUpload]);

      // Simulate upload progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 25) + 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Call mutation to store file metadata on complete
          uploadDocMutation.mutate(
            { name: taggedName, size: sizeStr },
            {
              onSuccess: () => {
                setTimeout(() => {
                  setUploadingFiles(prev => prev.filter(u => u.id !== uploadId));
                }, 600);
              },
              onError: () => {
                setUploadingFiles(prev => prev.filter(u => u.id !== uploadId));
                alert('Gagal mengunggah berkas bukti dukung.');
              }
            }
          );
        }

        setUploadingFiles(prev =>
          prev.map(u => (u.id === uploadId ? { ...u, progress: currentProgress } : u))
        );
      }, 150);
    });
  };

  // Add link handler
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    if (!linkInput.trim()) return;

    let targetUrl = linkInput.trim();
    // Validate or fix protocol
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      new URL(targetUrl);
    } catch (err) {
      setLinkError('Format URL tidak valid. Contoh: https://drive.google.com/share...');
      return;
    }

    addLinkMutation.mutate(targetUrl, {
      onSuccess: () => {
        setLinkInput('');
      },
      onError: () => {
        setLinkError('Gagal menyimpan tautan eksternal.');
      }
    });
  };

  // Simulated download action
  const handleDownloadFile = (doc: EvidenceDoc) => {
    const content = `ZONA INTEGRITAS - BUKTI DUKUNG
=============================
Indikator: ${indicator.code}
Pertanyaan LKE: ${indicator.question}
Nama Berkas: ${doc.name}
Ukuran Berkas: ${doc.size || 'Tidak diketahui'}
Tanggal Unggah: ${formatTimestamp(doc.uploadedAt)}
Diunggah Oleh: ${doc.uploadedBy || 'Sistem'}

--------------------------------------------------
Ini adalah simulasi pengunduhan dokumen bukti dukung asli dari basis data server LKE.
Semua riwayat pengunggahan tercatat dalam Jejak Audit Sistem secara otomatis.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name.includes('.') ? doc.name : `${doc.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseFileNameAndTag = (name: string) => {
    const match = name.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) {
      return { tag: match[1], cleanName: match[2] };
    }
    return { tag: null, cleanName: name };
  };

  const hasDocs = indicator.evidence_documents && indicator.evidence_documents.length > 0;
  const hasLinks = indicator.evidence_links && indicator.evidence_links.length > 0;

  return (
    <div className="space-y-5 mt-5 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-blue-600" />
          Bukti Dukung & Berkas Kelengkapan
        </h5>
        <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
          {(indicator.evidence_documents?.length || 0) + (indicator.evidence_links?.length || 0)} Bukti
        </span>
      </div>

      {/* Files List & Links Section */}
      <div className="space-y-4">
        {/* Document Section */}
        {hasDocs && (
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Dokumen / Berkas Unggahan ({indicator.evidence_documents?.length})</span>
            <div className="grid gap-2">
              {indicator.evidence_documents?.map((doc) => {
                const { tag, cleanName } = parseFileNameAndTag(doc.name);
                return (
                  <div 
                    key={doc.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {tag && (
                            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                              {tag}
                            </span>
                          )}
                          <p className="text-xs font-bold text-slate-800 break-all leading-snug">{cleanName}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-semibold">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{doc.size}</span>
                          {doc.uploadedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatTimestamp(doc.uploadedAt)}
                            </span>
                          )}
                          {doc.uploadedBy && (
                            <span className="flex items-center gap-1 bg-blue-50/50 text-blue-700 px-1.5 py-0.5 rounded">
                              <User className="w-3 h-3 text-blue-400" />
                              {doc.uploadedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadFile(doc)}
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-8 px-2 flex items-center gap-1.5 text-xs font-bold"
                        title="Unduh Berkas Bukti"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Unduh
                      </Button>
                      
                      {isEditable && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${doc.name}"?`)) {
                              deleteDocMutation.mutate(doc.id);
                            }
                          }}
                          disabled={deleteDocMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          title="Hapus Berkas Bukti"
                        >
                          {deleteDocMutation.isPending && deleteDocMutation.variables === doc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links Section */}
        {hasLinks && (
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Tautan Pendukung Eksternal ({indicator.evidence_links?.length})</span>
            <div className="grid gap-2">
              {indicator.evidence_links?.map((link) => (
                <div 
                  key={link.id} 
                  className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        {link.url}
                        <ExternalLink className="w-3 h-3 inline text-slate-400 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {isEditable && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Hapus tautan pendukung eksternal ini?')) {
                          deleteLinkMutation.mutate(link.id);
                        }
                      }}
                      disabled={deleteLinkMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                    >
                      {deleteLinkMutation.isPending && deleteLinkMutation.variables === link.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasDocs && !hasLinks && uploadingFiles.length === 0 && (
          <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-400">Belum ada bukti dukung berupa dokumen maupun tautan.</p>
          </div>
        )}
      </div>

      {/* Uploading Progress Bars */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Sedang Mengunggah...</span>
          <div className="space-y-2">
            {uploadingFiles.map(file => (
              <div key={file.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-xs animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="truncate max-w-[70%] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {file.name}
                  </span>
                  <span className="text-slate-500">{file.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-150" 
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Ukuran: {file.size}</span>
                  <span>&bull;</span>
                  <span>Menyimpan ke server LKE...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Area: Drag-and-Drop + Add Link Form */}
      {isEditable && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          {/* Drag & Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-250 flex flex-col items-center justify-center gap-2.5 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50/70 scale-[0.99] ring-2 ring-blue-500/20' 
                : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden" 
            />
            <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                Tarik & lepas dokumen bukti di sini, atau <span className="text-blue-600 hover:underline">klik untuk memilih</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Mendukung unggahan multi-file PDF, Word, Excel, JPG, PNG, atau ZIP (Maks. 10MB per berkas)
              </p>
            </div>
          </div>

          {/* Auto-tagging configuration toggler */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-xs mt-2">
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox" 
                id="auto-tag-checkbox"
                checked={autoTagEnabled}
                onChange={(e) => setAutoTagEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="auto-tag-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none flex items-center gap-1.5 flex-wrap">
                Penamaan Terstruktur Otomatis (Contoh: 
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-200">
                  [{indicator.code}] nama_berkas.pdf
                </span>
                )
              </label>
            </div>
            <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
              Memudahkan penyimpanan & audit eksternal
            </span>
          </div>

          {/* Add Link Form */}
          <form onSubmit={handleAddLink} className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">Tautan Pendukung Alternatif (Google Drive / Cloud Link)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Masukkan URL Link Bukti Dukung Eksternal..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 font-medium"
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                className="px-4 shrink-0 font-extrabold flex items-center gap-1 rounded-lg"
                disabled={addLinkMutation.isPending || !linkInput.trim()}
              >
                {addLinkMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </>
                )}
              </Button>
            </div>
            {linkError && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{linkError}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
