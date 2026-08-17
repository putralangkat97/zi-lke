import { http, HttpResponse } from 'msw';
import { mockUsers, mockLKE } from './data';
import { User, Indicator, LKE, Pokja, AuditLog } from '../types';

const memoryStorage: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage.getItem blocked for key "${key}", using memory storage fallback.`);
    return memoryStorage[key] || null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage.setItem blocked for key "${key}", using memory storage fallback.`);
    memoryStorage[key] = value;
  }
};

const getStoredUsers = (): User[] => {
  try {
    const stored = safeGetItem('lke_users');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading users from localStorage:', e);
  }
  const defaultUsers = [...mockUsers];
  safeSetItem('lke_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveUsers = (users: User[]) => {
  try {
    safeSetItem('lke_users', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
};

const getStoredActiveUser = (): User => {
  try {
    const stored = safeGetItem('lke_active_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const currentUsers = getStoredUsers();
      const exists = currentUsers.find(u => u.id === parsed.id);
      if (exists) return exists;
    }
  } catch (e) {
    console.error('Error reading active user from localStorage:', e);
  }
  return getStoredUsers()[0];
};

const getStoredLKEs = (): LKE[] => {
  try {
    const stored = safeGetItem('lkes_collection');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading LKE collection from localStorage:', e);
  }
  // Migration fallback: check if old single lke_data exists
  try {
    const oldSingle = safeGetItem('lke_data');
    if (oldSingle) {
      const parsedSingle = JSON.parse(oldSingle);
      const collection = [parsedSingle];
      safeSetItem('lkes_collection', JSON.stringify(collection));
      return collection;
    }
  } catch (e) {
    console.error('Error checking old single LKE:', e);
  }

  const defaultCollection = [JSON.parse(JSON.stringify(mockLKE))];
  safeSetItem('lkes_collection', JSON.stringify(defaultCollection));
  return defaultCollection;
};

const getStoredActiveLkeId = (): string => {
  try {
    const activeId = safeGetItem('lke_active_id');
    if (activeId) return activeId;
    safeSetItem('lke_active_id', 'lke-2026-1');
  } catch (e) {
    console.error('Error with active LKE ID in localStorage:', e);
  }
  return 'lke-2026-1';
};

let activeUser: User = getStoredActiveUser();
let lkesCollection = getStoredLKEs();
let activeLkeId = getStoredActiveLkeId();

const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const stored = safeGetItem('lke_audit_logs');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading audit logs from localStorage:', e);
  }
  return [];
};

let auditLogsCollection = getStoredAuditLogs();

const saveAuditLogs = () => {
  try {
    safeSetItem('lke_audit_logs', JSON.stringify(auditLogsCollection));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
};

const addAuditLog = (
  actionType: 'fill_answer' | 'submit_lke' | 'review_indicator' | 'status_change' | 'create_template' | 'delete_template' | 'switch_lke',
  lkeId: string,
  lkePeriod: string,
  details: {
    indicatorId?: string;
    indicatorCode?: string;
    pokjaCode?: string;
    pokjaName?: string;
    previousStatus?: string;
    newStatus?: string;
    previousValue?: string;
    newValue?: string;
    notes?: string;
    description: string;
  }
) => {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    lkeId,
    lkePeriod,
    timestamp: new Date().toISOString(),
    userId: activeUser.id,
    userName: activeUser.name,
    userRole: activeUser.role,
    actionType,
    details
  };
  auditLogsCollection.unshift(newLog);
  saveAuditLogs();
};

const saveLKEs = () => {
  try {
    safeSetItem('lkes_collection', JSON.stringify(lkesCollection));
  } catch (e) {
    console.error('Error saving LKE collection:', e);
  }
};

const saveActiveLkeId = (id: string) => {
  activeLkeId = id;
  try {
    safeSetItem('lke_active_id', id);
  } catch (e) {
    console.error('Error saving active LKE ID:', id);
  }
};

const getLkeById = (id: string): LKE | undefined => {
  if (id === 'active') {
    return lkesCollection.find(l => l.id === activeLkeId) || lkesCollection[0];
  }
  const found = lkesCollection.find(l => l.id === id);
  if (found) return found;
  if (id === 'lke-2026-1') {
    return lkesCollection.find(l => l.id === activeLkeId) || lkesCollection[0];
  }
  return undefined;
};

export const handlers = [
  http.get('/api/me', () => {
    return HttpResponse.json(activeUser);
  }),
  
  http.get('/api/users', () => {
    return HttpResponse.json(getStoredUsers());
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Omit<User, 'id'>;
    const currentUsers = getStoredUsers();
    
    const newUser: User = {
      ...body,
      id: `u${Date.now()}`
    };
    
    currentUsers.push(newUser);
    saveUsers(currentUsers);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.put('/api/active-user', async ({ request }) => {
    const { userId } = await request.json() as { userId: string };
    const currentUsers = getStoredUsers();
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
      activeUser = user;
      try {
        safeSetItem('lke_active_user', JSON.stringify(activeUser));
      } catch (e) {
        console.error(e);
      }
    }
    return HttpResponse.json(activeUser);
  }),

  // GET all LKE templates / instances
  http.get('/api/lkes', () => {
    return HttpResponse.json(lkesCollection);
  }),

  // GET audit logs
  http.get('/api/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const lkeId = url.searchParams.get('lkeId');
    const indicatorId = url.searchParams.get('indicatorId');
    const pokjaCode = url.searchParams.get('pokjaCode');
    
    let filtered = [...auditLogsCollection];
    if (lkeId) {
      filtered = filtered.filter(log => log.lkeId === lkeId);
    }
    if (indicatorId) {
      filtered = filtered.filter(log => log.details.indicatorId === indicatorId);
    }
    if (pokjaCode) {
      filtered = filtered.filter(log => log.details.pokjaCode === pokjaCode);
    }
    return HttpResponse.json(filtered);
  }),

  // POST create a new template for a new year
  http.post('/api/lkes', async ({ request }) => {
    const body = await request.json() as { period: string; unit_name: string; baseLkeId?: string };
    const { period, unit_name, baseLkeId } = body;
    
    // Find a base LKE to clone structure from
    const baseLke = (baseLkeId ? lkesCollection.find(l => l.id === baseLkeId) : null) || lkesCollection[0] || JSON.parse(JSON.stringify(mockLKE));
    
    // Clone
    const newLke = JSON.parse(JSON.stringify(baseLke)) as LKE;
    newLke.id = `lke-${period}-${Date.now()}`;
    newLke.period = period;
    newLke.unit_name = unit_name || baseLke.unit_name;
    newLke.status = 'Draft';
    newLke.created_at = new Date().toISOString();
    
    // Reset answers/status of all indicators in all pokjas
    newLke.pokjas.forEach((pokja: Pokja) => {
      pokja.progress = { total: pokja.indicators.length, filled: 0, revision_required: 0 };
      pokja.indicators.forEach((ind: Indicator) => {
        ind.status = 'not_filled';
        ind.selected_option_id = undefined;
        ind.answer_notes = undefined;
        ind.evidence_documents = [];
        ind.evidence_links = [];
        ind.reviewed_option_id = undefined;
        ind.review_notes = undefined;
        ind.score_percentage = undefined;
        ind.score_value = undefined;
        ind.last_editor = undefined;
        ind.updated_at = undefined;
      });
    });
    
    lkesCollection.push(newLke);
    saveLKEs();
    saveActiveLkeId(newLke.id);

    addAuditLog('create_template', newLke.id, newLke.period, {
      description: `Membuat template LKE baru untuk Periode Tahun ${newLke.period} (${newLke.unit_name}) dengan menyalin struktur dari LKE ${baseLke.period}`
    });
    
    return HttpResponse.json(newLke);
  }),

  // GET active LKE ID
  http.get('/api/lkes/active/id', () => {
    return HttpResponse.json({ activeId: activeLkeId });
  }),

  // PUT set active LKE ID
  http.put('/api/lkes/active/id', async ({ request }) => {
    const { activeId } = await request.json() as { activeId: string };
    const targetLke = lkesCollection.find(l => l.id === activeId);
    if (targetLke) {
      saveActiveLkeId(activeId);
      addAuditLog('switch_lke', targetLke.id, targetLke.period, {
        description: `Beralih ke evaluasi LKE aktif Periode Tahun ${targetLke.period}`
      });
      return HttpResponse.json({ activeId });
    }
    return HttpResponse.json({ message: 'LKE not found' }, { status: 404 });
  }),

  // DELETE template
  http.delete('/api/lkes/:id', ({ params }) => {
    const { id } = params;
    if (lkesCollection.length <= 1) {
      return HttpResponse.json({ message: 'Tidak dapat menghapus satu-satunya LKE yang tersisa.' }, { status: 400 });
    }
    if (id === activeLkeId) {
      return HttpResponse.json({ message: 'Tidak dapat menghapus LKE yang sedang aktif.' }, { status: 400 });
    }
    const index = lkesCollection.findIndex(l => l.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'LKE tidak ditemukan.' }, { status: 404 });
    }
    const deletedLke = lkesCollection[index];
    lkesCollection.splice(index, 1);
    saveLKEs();

    addAuditLog('delete_template', deletedLke.id, deletedLke.period, {
      description: `Menghapus permanen seluruh data evaluasi LKE Periode Tahun ${deletedLke.period} (${deletedLke.unit_name})`
    });

    return HttpResponse.json({ success: true });
  }),

  http.get('/api/lkes/:id', ({ params }) => {
    const { id } = params;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });

    // update progress before returning
    lke.pokjas.forEach((p: any) => {
      let filled = 0;
      let rev = 0;
      p.indicators.forEach((i: Indicator) => {
        if (i.selected_option_id) {
          filled++;
        }
        if (i.status === 'reviewed_revision_required') {
          rev++;
        }
      });
      p.progress.filled = filled;
      p.progress.revision_required = rev;
    });

    saveLKEs();
    return HttpResponse.json(lke);
  }),

  http.put('/api/lkes/:id/indicators/:indId/answer', async ({ request, params }) => {
    const { id, indId } = params;
    const body = await request.json() as any;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const prevOptionId = foundIndicator.selected_option_id;
    const prevOption = foundIndicator.options.find(o => o.id === prevOptionId);
    const prevValue = prevOption ? `${prevOption.label} (${prevOption.criteria})` : 'Belum Dijawab';
    const prevScore = prevOption ? ((prevOption.score_percentage * foundIndicator.weight) / 100).toFixed(2) : '0.00';

    const newOptionId = body.selected_option_id;
    const newOption = foundIndicator.options.find(o => o.id === newOptionId);
    const newValue = newOption ? `${newOption.label} (${newOption.criteria})` : 'Belum Dijawab';
    const newScore = newOption ? ((newOption.score_percentage * foundIndicator.weight) / 100).toFixed(2) : '0.00';

    const description = `Mengisi evaluasi mandiri Indikator ${foundIndicator.code} (${foundIndicator.pokja_name}): Jawaban diubah dari "${prevValue}" (Skor: ${prevScore}) menjadi "${newValue}" (Skor: ${newScore}).`;

    foundIndicator.selected_option_id = body.selected_option_id;
    foundIndicator.answer_notes = body.answer_notes;
    foundIndicator.status = "filled";
    // Clear stale review details when Unit Kerja corrects their answer
    foundIndicator.reviewed_option_id = undefined;
    foundIndicator.review_notes = undefined;
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    saveLKEs();

    addAuditLog('fill_answer', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      previousStatus: 'not_filled',
      newStatus: 'filled',
      previousValue: prevValue,
      newValue: newValue,
      notes: body.answer_notes,
      description
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.post('/api/lkes/:id/indicators/:indId/evidence', async ({ request, params }) => {
    const { id, indId } = params;
    const body = await request.json() as any;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: body.name,
      size: body.size || 'Unknown',
      url: body.url || `https://example.com/mock-files/${body.name}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: activeUser.name
    };

    if (!foundIndicator.evidence_documents) {
      foundIndicator.evidence_documents = [];
    }
    foundIndicator.evidence_documents.push(newDoc);
    
    foundIndicator.status = "filled";
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    saveLKEs();

    addAuditLog('fill_answer', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      description: `Mengunggah bukti dukung "${newDoc.name}" (${newDoc.size}) untuk Indikator ${foundIndicator.code}`
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.delete('/api/lkes/:id/indicators/:indId/evidence/:docId', async ({ params }) => {
    const { id, indId, docId } = params;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const docs = foundIndicator.evidence_documents || [];
    const docToDelete = docs.find(d => d.id === docId);
    if (!docToDelete) return HttpResponse.json({ message: "Document not found" }, { status: 404 });

    foundIndicator.evidence_documents = docs.filter(d => d.id !== docId);
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    saveLKEs();

    addAuditLog('fill_answer', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      description: `Menghapus bukti dukung "${docToDelete.name}" untuk Indikator ${foundIndicator.code}`
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.post('/api/lkes/:id/indicators/:indId/links', async ({ request, params }) => {
    const { id, indId } = params;
    const { url } = await request.json() as { url: string };
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const newLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url
    };

    if (!foundIndicator.evidence_links) {
      foundIndicator.evidence_links = [];
    }
    foundIndicator.evidence_links.push(newLink);
    
    foundIndicator.status = "filled";
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    saveLKEs();

    addAuditLog('fill_answer', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      description: `Menambahkan link bukti dukung "${url}" untuk Indikator ${foundIndicator.code}`
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.delete('/api/lkes/:id/indicators/:indId/links/:linkId', async ({ params }) => {
    const { id, indId, linkId } = params;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const links = foundIndicator.evidence_links || [];
    const linkToDelete = links.find(l => l.id === linkId);
    if (!linkToDelete) return HttpResponse.json({ message: "Link not found" }, { status: 404 });

    foundIndicator.evidence_links = links.filter(l => l.id !== linkId);
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    saveLKEs();

    addAuditLog('fill_answer', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      description: `Menghapus link bukti dukung "${linkToDelete.url}" untuk Indikator ${foundIndicator.code}`
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.put('/api/lkes/:id/indicators/:indId/review', async ({ request, params }) => {
    const { id, indId } = params;
    const body = await request.json() as any;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });
    
    let foundIndicator: Indicator | null = null;
    for (const p of lke.pokjas) {
      const ind = p.indicators.find((i: Indicator) => i.id === indId);
      if (ind) {
        foundIndicator = ind;
        break;
      }
    }

    if (!foundIndicator) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const prevReviewOptionId = foundIndicator.reviewed_option_id;
    const prevReviewOption = foundIndicator.options.find(o => o.id === prevReviewOptionId);
    const prevReviewValue = prevReviewOption ? `${prevReviewOption.label} (${prevReviewOption.criteria})` : 'Belum Direviu';
    const prevReviewScore = prevReviewOption ? ((prevReviewOption.score_percentage * foundIndicator.weight) / 100).toFixed(2) : '0.00';

    const newReviewOptionId = body.reviewed_option_id;
    const newReviewOption = foundIndicator.options.find(o => o.id === newReviewOptionId);
    const newReviewValue = newReviewOption ? `${newReviewOption.label} (${newReviewOption.criteria})` : 'Belum Direviu';
    const newReviewScore = newReviewOption ? ((newReviewOption.score_percentage * foundIndicator.weight) / 100).toFixed(2) : '0.00';

    const statusMap: Record<string, string> = {
      'reviewed_accepted': 'Disetujui',
      'reviewed_revision_required': 'Butuh Revisi'
    };
    const newStatusName = statusMap[body.status] || body.status;

    const description = `Melakukan reviu TPI Indikator ${foundIndicator.code} (${foundIndicator.pokja_name}): Hasil diubah dari "${prevReviewValue}" (Skor TPI: ${prevReviewScore}) menjadi "${newReviewValue}" (Skor TPI: ${newReviewScore}). Status reviu diatur ke "${newStatusName}".`;

    foundIndicator.reviewed_option_id = body.reviewed_option_id;
    foundIndicator.review_notes = body.review_notes;
    foundIndicator.status = body.status; // 'reviewed_accepted' or 'reviewed_revision_required'
    foundIndicator.last_editor = activeUser.name;
    foundIndicator.updated_at = new Date().toISOString();

    // Automatically transition to "In Review" if currently "Submitted"
    if (lke.status === "Submitted") {
      lke.status = "In Review";
    }

    saveLKEs();

    addAuditLog('review_indicator', lke.id, lke.period, {
      indicatorId: typeof indId === 'string' ? indId : undefined,
      indicatorCode: foundIndicator.code,
      pokjaCode: foundIndicator.pokja_code,
      pokjaName: foundIndicator.pokja_name,
      previousStatus: foundIndicator.status,
      newStatus: body.status,
      previousValue: prevReviewValue,
      newValue: newReviewValue,
      notes: body.review_notes,
      description
    });

    return HttpResponse.json(foundIndicator);
  }),

  http.put('/api/lkes/:id/status', async ({ request, params }) => {
    const { id } = params;
    const { status } = await request.json() as { status: any };
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });

    const prevStatus = lke.status;
    lke.status = status;
    saveLKEs();

    addAuditLog('status_change', lke.id, lke.period, {
      previousStatus: prevStatus,
      newStatus: status,
      description: `Mengubah status evaluasi LKE Periode Tahun ${lke.period} dari "${prevStatus}" menjadi "${status}"`
    });

    return HttpResponse.json(lke);
  }),
  
  http.put('/api/lkes/:id/submit', ({ params }) => {
    const { id } = params;
    const lke = getLkeById(id as string);
    if (!lke) return HttpResponse.json({ message: "LKE not found" }, { status: 404 });

    const prevStatus = lke.status;
    lke.status = "Submitted";
    saveLKEs();

    addAuditLog('submit_lke', lke.id, lke.period, {
      previousStatus: prevStatus,
      newStatus: 'Submitted',
      description: `Melakukan submit (pengiriman) berkas LKE Zona Integritas Periode ${lke.period} ke Tim Penilai Internal (TPI)`
    });

    return HttpResponse.json(lke);
  })
];
