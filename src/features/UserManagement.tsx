import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Role } from '../types';
import { Users, Plus, Shield, ShieldCheck, Mail, Hash, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('anggota_pokja');
  const [assignedPokjas, setAssignedPokjas] = useState<string[]>([]);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  const addUserMutation = useMutation({
    mutationFn: (newUser: Omit<User, 'id'>) => 
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('anggota_pokja');
    setAssignedPokjas([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      
    addUserMutation.mutate({
      name,
      email,
      role,
      assigned_pokja: assignedPokjas.length > 0 ? assignedPokjas : undefined
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Shield className="w-12 h-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Akses Ditolak</h2>
        <p>Hanya Admin yang dapat mengakses halaman manajemen pengguna.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Manajemen Pengguna</h1>
            <p className="text-sm font-semibold text-slate-500">Kelola akses, peran, dan penugasan Pokja.</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-xs">
                <tr>
                  <th className="px-6 py-4">Nama & Email</th>
                  <th className="px-6 py-4">Peran</th>
                  <th className="px-6 py-4">Penugasan Pokja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1 font-medium">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.assigned_pokja && u.assigned_pokja.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.assigned_pokja.map(p => (
                            <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                              <Hash className="w-3 h-3" /> Pokja {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium italic">Tidak ada penugasan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-800">Tambah Pengguna Baru</h3>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cth. Budi Santoso"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cth. budi@unit.go.id"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Peran (Role)</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="pimpinan">Pimpinan</option>
                  <option value="ketua_tim">Ketua Tim ZI</option>
                  <option value="ketua_pokja">Ketua Pokja</option>
                  <option value="anggota_pokja">Anggota Pokja</option>
                  <option value="tpi">TPI / Evaluator</option>
                </select>
              </div>

              {(role === 'ketua_pokja' || role === 'anggota_pokja') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Penugasan Pokja</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {[
                      { id: '1', name: 'Pokja 1 (Manajemen Perubahan)' },
                      { id: '2', name: 'Pokja 2 (Penataan Tatalaksana)' },
                      { id: '3', name: 'Pokja 3 (SDM Aparatur)' },
                      { id: '4', name: 'Pokja 4 (Akuntabilitas)' },
                      { id: '5', name: 'Pokja 5 (Penguatan Pengawasan)' },
                      { id: '6', name: 'Pokja 6 (Pelayanan Publik)' }
                    ].map((pokja) => (
                      <label key={pokja.id} className="flex items-start gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          checked={assignedPokjas.includes(pokja.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedPokjas(prev => [...prev, pokja.id]);
                            } else {
                              setAssignedPokjas(prev => prev.filter(id => id !== pokja.id));
                            }
                          }}
                        />
                        <span className="text-xs font-medium text-slate-700 leading-tight">
                          {pokja.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    Pilih satu atau lebih Pokja yang menjadi tanggung jawab pengguna ini.
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={addUserMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
