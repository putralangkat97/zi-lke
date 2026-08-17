import { User, LKE, Pokja, Indicator } from "../types";

export const mockUsers: User[] = [
  { id: "u1", name: "Admin Unit", email: "admin@unit.go.id", role: "admin" },
  { id: "u2", name: "Ketua Tim ZI", email: "ketua@unit.go.id", role: "ketua_tim" },
  { id: "u3", name: "Ketua Pokja 1 (Manajemen Perubahan)", email: "pokja1@unit.go.id", role: "ketua_pokja", assigned_pokja: ["1"] },
  { id: "u4", name: "Anggota Pokja 1 (Manajemen Perubahan)", email: "anggota1@unit.go.id", role: "anggota_pokja", assigned_pokja: ["1"] },
  { id: "u5", name: "Ketua Pokja 2 (Penataan Tatalaksana)", email: "pokja2@unit.go.id", role: "ketua_pokja", assigned_pokja: ["2"] },
  { id: "u8", name: "Ketua Pokja 3 (SDM Aparatur)", email: "pokja3@unit.go.id", role: "ketua_pokja", assigned_pokja: ["3"] },
  { id: "u9", name: "Ketua Pokja 4 (Akuntabilitas)", email: "pokja4@unit.go.id", role: "ketua_pokja", assigned_pokja: ["4"] },
  { id: "u10", name: "Ketua Pokja 5 (Penguatan Pengawasan)", email: "pokja5@unit.go.id", role: "ketua_pokja", assigned_pokja: ["5"] },
  { id: "u11", name: "Ketua Pokja 6 (Pelayanan Publik)", email: "pokja6@unit.go.id", role: "ketua_pokja", assigned_pokja: ["6"] },
  { id: "u6", name: "TPI Evaluator (Kementerian)", email: "tpi@pusat.go.id", role: "tpi" },
  { id: "u7", name: "Pimpinan / Kakan", email: "pimpinan@unit.go.id", role: "pimpinan" },
];

export const mockLKE: LKE = {
  id: "lke-2026-1",
  unit_name: "Kantor Pertanahan Kota Binjai",
  period: "2026",
  status: "Draft",
  created_at: "2026-01-01T00:00:00Z",
  pokjas: [
    {
      code: "1",
      name: "Manajemen Perubahan",
      weight: 8,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-1-i-a",
          code: "A.1.i.a",
          area_code: "A",
          pokja_code: "1",
          pokja_name: "Manajemen Perubahan",
          section_path: [
            { code: "i", name: "Penyusunan Tim Kerja", weight: 0.5 }
          ],
          question: "Unit kerja telah membentuk tim untuk melakukan pembangunan Zona Integritas.",
          weight: 0.5,
          answer_input_type: "yes_no",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-yes", label: "Ya", criteria: "Ya, jika Tim telah dibentuk di dalam unit kerja.", score_percentage: 100 },
            { id: "opt-no", label: "Tidak", criteria: "Tidak dibentuk", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-1-i-b",
          code: "A.1.i.b",
          area_code: "A",
          pokja_code: "1",
          pokja_name: "Manajemen Perubahan",
          section_path: [
            { code: "i", name: "Penyusunan Tim Kerja", weight: 0.5 }
          ],
          question: "Penentuan anggota Tim dipilih melalui prosedur/mekanisme yang jelas",
          weight: 0.5,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Jika dengan prosedur/mekanisme yang jelas dan mewakili seluruh unsur dalam unit kerja", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Jika sebagian menggunakan prosedur yang mewakili sebagian besar unsur dalam unit kerja", score_percentage: 50 },
            { id: "opt-c", label: "C", criteria: "Jika tidak di seleksi", score_percentage: 0 }
          ]
        }
      ]
    },
    {
      code: "2",
      name: "Penataan Tatalaksana",
      weight: 7,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-2-i-a",
          code: "A.2.i.a",
          area_code: "A",
          pokja_code: "2",
          pokja_name: "Penataan Tatalaksana",
          section_path: [
            { code: "i", name: "Prosedur Operasional Tetap (SOP) Kegiatan Utama", weight: 1 }
          ],
          question: "SOP mengacu pada peta proses bisnis instansi",
          weight: 1,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Jika semua SOP unit telah mengacu peta proses bisnis dan juga melakukan inovasi yang selaras", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Jika semua SOP unit telah mengacu peta proses bisnis", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Jika sebagian SOP unit telah mengacu peta proses bisnis", score_percentage: 50 },
            { id: "opt-d", label: "D", criteria: "Jika belum terdapat SOP unit yang mengacu peta proses bisnis", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-2-i-b",
          code: "A.2.i.b",
          area_code: "A",
          pokja_code: "2",
          pokja_name: "Penataan Tatalaksana",
          section_path: [
            { code: "i", name: "Prosedur Operasional Tetap (SOP) Kegiatan Utama", weight: 1 }
          ],
          question: "Prosedur operasional tetap (SOP) telah diterapkan",
          weight: 1,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Jika unit telah menerapkan seluruh SOP yang ditetapkan organisasi dan juga melakukan inovasi pada SOP yang diterapkan", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Jika unit telah menerapkan seluruh SOP yang ditetapkan organisasi", score_percentage: 80 },
            { id: "opt-c", label: "C", criteria: "Jika unit telah menerapkan sebagian besar SOP yang ditetapkan organisasi", score_percentage: 60 },
            { id: "opt-d", label: "D", criteria: "Jika unit telah menerapkan sebagian kecil SOP yang ditetapkan organisasi", score_percentage: 40 },
            { id: "opt-e", label: "E", criteria: "Jika unit belum menerapkan SOP yang telah ditetapkan organisasi", score_percentage: 0 }
          ]
        }
      ]
    },
    {
      code: "3",
      name: "Penataan Sistem Manajemen SDM Aparatur",
      weight: 10,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-3-i-a",
          code: "A.3.i.a",
          area_code: "A",
          pokja_code: "3",
          pokja_name: "Penataan Sistem Manajemen SDM Aparatur",
          section_path: [
            { code: "i", name: "Perencanaan Kebutuhan Pegawai", weight: 1.5 }
          ],
          question: "Kebutuhan pegawai di unit kerja disusun berdasarkan Analisis Jabatan dan Analisis Beban Kerja (ABK).",
          weight: 1.5,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Jika perencanaan kebutuhan pegawai sepenuhnya didasarkan pada analisis jabatan dan analisis beban kerja, serta direview berkala.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Jika perencanaan kebutuhan didasarkan pada analisis jabatan dan beban kerja namun belum dievaluasi secara berkala.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Jika perencanaan kebutuhan pegawai hanya berdasarkan usulan kasatker tanpa analisis jabatan dan beban kerja yang matang.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Jika belum terdapat perencanaan kebutuhan pegawai yang sistematis.", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-3-ii-a",
          code: "A.3.ii.a",
          area_code: "A",
          pokja_code: "3",
          pokja_name: "Penataan Sistem Manajemen SDM Aparatur",
          section_path: [
            { code: "ii", name: "Pengembangan Kompetensi Pegawai", weight: 1.5 }
          ],
          question: "Unit Kerja memfasilitasi pengembangan kompetensi pegawai (diklat/pelatihan/bimtek) untuk mendukung kinerja organisasi.",
          weight: 1.5,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Seluruh pegawai telah mendapatkan kesempatan pengembangan kompetensi minimal 20 jam pelajaran per tahun dan dipantau.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Sebagian besar pegawai (>75%) telah mengikuti program pengembangan kompetensi.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Sebagian kecil pegawai (<50%) telah mengikuti program pengembangan kompetensi.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Tidak ada program pengembangan kompetensi pegawai.", score_percentage: 0 }
          ]
        }
      ]
    },
    {
      code: "4",
      name: "Penguatan Akuntabilitas Kinerja",
      weight: 10,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-4-i-a",
          code: "A.4.i.a",
          area_code: "A",
          pokja_code: "4",
          pokja_name: "Penguatan Akuntabilitas Kinerja",
          section_path: [
            { code: "i", name: "Keterlibatan Pimpinan", weight: 2 }
          ],
          question: "Pimpinan unit kerja terlibat langsung dalam penyusunan Perencanaan Strategis, Perjanjian Kinerja, dan Pemantauan Kinerja.",
          weight: 2,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Pimpinan memimpin langsung rapat penyusunan, menetapkan IKU, dan memantau pencapaian target secara bulanan.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Pimpinan terlibat dalam rapat penyusunan namun pemantauan pencapaian target hanya dilakukan per semester.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Pimpinan hanya menandatangani dokumen kinerja tanpa terlibat aktif dalam proses penyusunan.", score_percentage: 30 },
            { id: "opt-d", label: "D", criteria: "Pimpinan tidak terlibat sama sekali.", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-4-ii-a",
          code: "A.4.ii.a",
          area_code: "A",
          pokja_code: "4",
          pokja_name: "Penguatan Akuntabilitas Kinerja",
          section_path: [
            { code: "ii", name: "Pengelolaan Akuntabilitas Kinerja", weight: 2 }
          ],
          question: "Laporan Kinerja Instansi Pemerintah (LAKIP) disusun tepat waktu dan menyajikan informasi pencapaian kinerja yang akurat.",
          weight: 2,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Laporan disusun tepat waktu, diunggah ke portal nasional, dan hasil kinerjanya dipublikasikan kepada masyarakat.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Laporan disusun tepat waktu namun belum dipublikasikan secara luas kepada publik.", score_percentage: 70 },
            { id: "opt-c", label: "C", criteria: "Laporan disusun terlambat tetapi menyajikan data pencapaian yang lengkap.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Laporan tidak disusun.", score_percentage: 0 }
          ]
        }
      ]
    },
    {
      code: "5",
      name: "Penguatan Pengawasan",
      weight: 15,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-5-i-a",
          code: "A.5.i.a",
          area_code: "A",
          pokja_code: "5",
          pokja_name: "Penguatan Pengawasan",
          section_path: [
            { code: "i", name: "Pengendalian Gratifikasi", weight: 2.5 }
          ],
          question: "Unit kerja telah mengimplementasikan kebijakan dan sistem penanganan gratifikasi secara efektif.",
          weight: 2.5,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Telah dibentuk Unit Pengendalian Gratifikasi (UPG), melakukan sosialisasi publik, serta menyediakan saluran pelaporan aktif.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Telah dibentuk UPG dan melakukan sosialisasi internal, namun belum menyentuh publik/pengguna layanan.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Hanya sebatas memasang banner tolak gratifikasi tanpa struktur organisasi UPG yang berjalan.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Belum ada upaya pengendalian gratifikasi.", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-5-ii-a",
          code: "A.5.ii-a",
          area_code: "A",
          pokja_code: "5",
          pokja_name: "Penguatan Pengawasan",
          section_path: [
            { code: "ii", name: "Penerapan Whistle Blowing System (WBS)", weight: 2.5 }
          ],
          question: "Unit kerja menerapkan Whistle Blowing System (WBS) dan menindaklanjuti setiap pengaduan yang masuk.",
          weight: 2.5,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "WBS telah diintegrasikan, menjamin kerahasiaan pelapor, dan 100% pengaduan ditindaklanjuti secara profesional.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "WBS berjalan dan menjamin kerahasiaan pelapor, namun persentase tindak lanjut pengaduan di bawah 100%.", score_percentage: 70 },
            { id: "opt-c", label: "C", criteria: "WBS tersedia secara fisik (kotak pengaduan) namun belum dikelola secara berkala dan terdokumentasi.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Belum memiliki saluran pengaduan pelanggaran.", score_percentage: 0 }
          ]
        }
      ]
    },
    {
      code: "6",
      name: "Peningkatan Kualitas Pelayanan Publik",
      weight: 10,
      progress: { total: 2, filled: 0, revision_required: 0 },
      indicators: [
        {
          id: "ind-a-6-i-a",
          code: "A.6.i.a",
          area_code: "A",
          pokja_code: "6",
          pokja_name: "Peningkatan Kualitas Pelayanan Publik",
          section_path: [
            { code: "i", name: "Standar Pelayanan", weight: 2 }
          ],
          question: "Unit kerja telah menetapkan Standar Pelayanan untuk semua jenis layanan utama dan memaklumkannya kepada publik.",
          weight: 2,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "Seluruh jenis layanan memiliki standar pelayanan (maklumat terpajang dan dipublikasikan di web/media sosial), serta direview secara partisipatif.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "Standar pelayanan telah ditetapkan dan dimaklumkan kepada publik, namun belum pernah dievaluasi secara partisipatif.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "Baru sebagian layanan utama yang memiliki standar operasional yang terpajang.", score_percentage: 50 },
            { id: "opt-d", label: "D", criteria: "Belum menetapkan maklumat standar pelayanan.", score_percentage: 0 }
          ]
        },
        {
          id: "ind-a-6-ii-a",
          code: "A.6.ii.a",
          area_code: "A",
          pokja_code: "6",
          pokja_name: "Peningkatan Kualitas Pelayanan Publik",
          section_path: [
            { code: "ii", name: "Survei Kepuasan Masyarakat", weight: 2 }
          ],
          question: "Unit kerja melakukan Survei Kepuasan Masyarakat (SKM) secara berkala dan menindaklanjuti hasil rekomendasi survei.",
          weight: 2,
          answer_input_type: "single_choice",
          is_answer_required: true,
          is_evidence_required: true,
          status: "not_filled",
          options: [
            { id: "opt-a", label: "A", criteria: "SKM dilakukan berkala tiap triwulan, hasilnya dipublikasikan ke publik, dan 100% rekomendasi perbaikan pelayanan ditindaklanjuti.", score_percentage: 100 },
            { id: "opt-b", label: "B", criteria: "SKM dilakukan per semester, dipublikasikan, namun baru sebagian rekomendasi ditindaklanjuti.", score_percentage: 75 },
            { id: "opt-c", label: "C", criteria: "SKM hanya dilakukan setahun sekali secara formalitas tanpa ada tindak lanjut perbaikan yang jelas.", score_percentage: 40 },
            { id: "opt-d", label: "D", criteria: "Belum pernah melakukan Survei Kepuasan Masyarakat.", score_percentage: 0 }
          ]
        }
      ]
    }
  ]
};
