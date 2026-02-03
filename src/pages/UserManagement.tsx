import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_USERS } from '../constants';
import { TeamMap } from '../components/TeamMap';
import { ShiftScheduler } from '../components/ShiftScheduler';
import { User } from '../types';

type UserStatus = 'active' | 'inactive';
type FilterTab = 'Todos' | 'Ativos' | 'Inativos' | 'Admin';

export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'schedule'>('list');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    setUsers(MOCK_USERS as User[]);
    setLoading(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());

      const isSupervisor = user.role.toLowerCase().includes('supervisor');

      if (activeTab === 'Ativos') return matchesSearch && user.status === 'active';
      if (activeTab === 'Inativos') return matchesSearch && user.status === 'inactive';
      if (activeTab === 'Admin') return matchesSearch && isSupervisor;
      return matchesSearch;
    });
  }, [users, searchQuery, activeTab]);

  const handleDeactivate = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? (Simulação)')) return;
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className={`transition-all duration-500 ease-in-out ${viewMode === 'schedule' ? 'max-w-[95vw]' : 'max-w-4xl'} mx-auto p-4 md:p-8 space-y-8`}>
      <header className="flex justify-between items-center bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white tracking-tight">Equipes</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gestão e Localização</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-background-dark p-1 rounded-2xl flex gap-1 border border-white/5">
            <button
              onClick={() => setViewMode('list')}
              className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-lg">list</span>
              <span className="text-xs font-bold">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-lg">map</span>
              <span className="text-xs font-bold">Mapa</span>
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'schedule' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span className="text-xs font-bold">Escala</span>
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-500">search</span>
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou matrícula"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-dark border-white/5 rounded-2xl pl-14 pr-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-lg"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
        <button
          onClick={() => setActiveTab('Todos')}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'Todos' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark text-gray-300 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-base">group</span> Todos
        </button>
        <button
          onClick={() => setActiveTab('Ativos')}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'Ativos' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark text-gray-300 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-base">check_circle</span> Ativos
        </button>
        <button
          onClick={() => setActiveTab('Inativos')}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'Inativos' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark text-gray-300 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-base">cancel</span> Inativos
        </button>
        <button
          onClick={() => setActiveTab('Admin')}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'Admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark text-gray-300 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-base">security</span> Admin
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {viewMode === 'list' ? `Colaboradores (${filteredUsers.length})` :
              viewMode === 'map' ? 'Densidade Geográfica' : 'Escala Operacional'}
          </p>
          {viewMode === 'map' && (
            <p className="text-[10px] text-primary font-black uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded border border-primary/20 animate-pulse">
              Live: Visão Home Office
            </p>
          )}
        </div>

        {viewMode === 'list' ? (
          <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            {filteredUsers.map((user, idx) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors cursor-pointer group ${idx !== filteredUsers.length - 1 ? 'border-b border-white/5' : ''} ${user.status === 'inactive' ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.avatar ? (
                      <img src={user.avatar} className="h-12 w-12 rounded-2xl object-cover shadow-lg" alt={user.name} />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary font-black flex items-center justify-center text-lg">{user.initials}</div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface-dark ${user.status === 'active' ? 'bg-success' : 'bg-gray-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      {user.role === 'Supervisor N2' && (
                        <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">{user.role} • {user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[10px] text-gray-600">location_on</span>
                      <span className="text-[10px] text-gray-600 font-medium truncate max-w-[150px]">{user.address || 'Endereço não informado'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    title="Editar"
                    className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeactivate(user.id)}
                    title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                    className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">{user.status === 'active' ? 'person_off' : 'person_check'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    title="Excluir"
                    className="h-9 w-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <TeamMap users={filteredUsers} />
        ) : (
          <ShiftScheduler users={filteredUsers} />
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 md:bottom-8 right-6 md:right-12 z-40">
        <button
          onClick={() => setShowAddModal(true)}
          className="h-14 w-14 md:h-16 md:w-16 rounded-3xl bg-primary shadow-2xl shadow-primary/40 hover:bg-primary-dark transition-transform active:scale-90 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-3xl">person_add</span>
        </button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Novo Usuário</h2>
                <p className="text-xs text-gray-500 mt-1">Configure o acesso do colaborador</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newUser = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
                address: formData.get('address') as string,
                avatar: avatarPreview || undefined, // undefined to fix Type error if null
                status: 'active' as UserStatus,
                initials: (formData.get('name') as string).split(' ').map(n => n[0]).join('').toUpperCase()
              };

              setUsers([newUser, ...users]);
              setShowAddModal(false);
              setAvatarPreview(null);
            }}>
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                  <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="h-full w-full object-cover" alt="Preview" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary/40">add_a_photo</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">upload</span>
                  </div>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatarPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Clique para subir avatar</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Nome Completo</label>
                <input name="name" required type="text" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">E-mail</label>
                <input name="email" required type="email" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Endereço</label>
                <input name="address" required type="text" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Cargo/Função</label>
                <select name="role" required className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="Operador NOC">Operador NOC</option>
                  <option value="Supervisor N2">Supervisor N2</option>
                  <option value="Técnico de Campo">Técnico de Campo</option>
                  <option value="Gestão Operacional">Gestão Operacional</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all mt-4">
                Criar Acesso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Editar Usuário</h2>
                <p className="text-xs text-gray-500 mt-1">Atualize os dados do colaborador</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedFields = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
                address: formData.get('address') as string,
                avatar: avatarPreview || editingUser.avatar,
                initials: (formData.get('name') as string).split(' ').map(n => n[0]).join('').toUpperCase()
              };

              setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedFields } : u));
              setEditingUser(null);
              setAvatarPreview(null);
            }}>
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('edit-avatar-upload')?.click()}>
                  <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all">
                    {avatarPreview || editingUser.avatar ? (
                      <img src={avatarPreview || editingUser.avatar} className="h-full w-full object-cover" alt="Preview" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary/40">account_circle</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>
                </div>
                <input
                  id="edit-avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatarPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Trocar foto de perfil</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Nome Completo</label>
                <input name="name" defaultValue={editingUser.name} required type="text" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">E-mail</label>
                <input name="email" defaultValue={editingUser.email} required type="email" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Endereço</label>
                <input name="address" defaultValue={editingUser.address} required type="text" className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Cargo/Função</label>
                <select name="role" defaultValue={editingUser.role} required className="w-full bg-[#1a0f10] border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="Operador NOC">Operador NOC</option>
                  <option value="Supervisor N2">Supervisor N2</option>
                  <option value="Técnico de Campo">Técnico de Campo</option>
                  <option value="Gestão Operacional">Gestão Operacional</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all mt-4">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
