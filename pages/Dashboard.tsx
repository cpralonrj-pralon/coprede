
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchRawIncidents, fetchSGO, fetchGponEvents, calculateMetrics, calculateSgoMetrics, DashboardMetrics, ApiIncident, SgoIncident } from '../apiService';
import { GponEvent } from '../types';


interface DashboardProps {
  onOpenIncident: () => void;
  session: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenIncident, session }) => {
  const [allIncidents, setAllIncidents] = useState<ApiIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // SGO State
  const [sgoIncidents, setSgoIncidents] = useState<any[]>([]);

  // View State
  const [activeTab, setActiveTab] = useState<'newmonitor' | 'sgo'>('sgo');

  // Filter States
  const [selectedTime, setSelectedTime] = useState<string>('Tudo');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // SGO Filter States
  const [sgoSelectedTime, setSgoSelectedTime] = useState<string>('Tudo');
  const [sgoSelectedRedes, setSgoSelectedRedes] = useState<string[]>([]);
  const [sgoSelectedStatuses, setSgoSelectedStatuses] = useState<string[]>([]);
  const [sgoSelectedGrupos, setSgoSelectedGrupos] = useState<string[]>([]);
  const [sgoSelectedClusters, setSgoSelectedClusters] = useState<string[]>([]);
  const [showSgoTimeDropdown, setShowSgoTimeDropdown] = useState(false);
  const [showSgoRedeDropdown, setShowSgoRedeDropdown] = useState(false);
  const [showSgoStatusDropdown, setShowSgoStatusDropdown] = useState(false);
  const [showSgoGrupoDropdown, setShowSgoGrupoDropdown] = useState(false);
  const [showSgoClusterDropdown, setShowSgoClusterDropdown] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      const isInitial = allIncidents.length === 0;
      try {
        // Only show full loading state if we have absolutely no data
        if (isInitial) setLoading(true);

        // Fetch Parallel
        const [monitorData, gponData] = await Promise.all([
          fetchRawIncidents(),
          fetchGponEvents()
        ]);

        // Map GPON Data to SGO Format for compatibility
        const mappedSgoData = gponData.map((event: GponEvent) => ({
          ticket: event.id_mostra?.toString() || 'N/A',
          incidente: event.nm_tipo || 'Evento GPON',
          sintoma: event.ds_sumario || event.nm_tipo || '',
          acionado: event.nm_status || 'Novo',
          dataInicio: event.dh_inicio || new Date().toISOString(),
          observacao: event.ds_sumario || '',
          cidade: event.nm_cidade || 'N/A',
          node: event.nm_origem || 'N/A', // Using nm_origem as Node/Equipment
          tecnologia: event.nm_cat_prod3 || 'GPON',
          rede: event.nm_cat_prod2 || 'VITAL',
          sintomaOper: event.nm_cat_oper2 || 'SEM_CAT',
          impacto: 'MÉDIO', // Default or infer
          regional: event.regional || 'N/A',
          grupo: event.grupo || 'N/A',
          cluster: event.cluster || 'N/A',
          subcluster: event.subcluster || 'N/A'
        }));

        if (gponData.length === 0) {
          console.warn('DEBUG: GPON Data is empty.');
          // Only alert if in dev or if user explicitly requested debug, but here helpful
          // alert('Atenção: Arquivo de dados existe mas está vazio.');
        }

        console.log('DEBUG - mappedSgoData item 0:', mappedSgoData[0]);
        setAllIncidents(monitorData);
        setSgoIncidents(mappedSgoData);
        setError(null);
      } catch (err: any) {
        if (isInitial) setError('Erro ao carregar dados operacionais');
        const msg = err?.message || 'Erro desconhecido';
        console.error('Erro na sincronização de fundo:', err);
        alert(`Erro ao carregar dados: ${msg}\nVerifique o console para mais detalhes.`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, []);

  // Presence logic removed (Supabase dependency removed)
  useEffect(() => {
    // Mock online user (self)
    if (session?.user) {
      setOnlineUsers([{
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email
      }]);
    }
  }, [session]);

  const filteredMetrics = useMemo(() => {
    let filtered = [...allIncidents];

    // Date filtering (Simplified for 'Hoje' based on the latest date in the dataset)
    if (selectedTime === 'Hoje' && allIncidents.length > 0) {
      const latestDate = allIncidents[0].data.split('T')[0];
      filtered = filtered.filter(i => i.data.startsWith(latestDate));
    } else if (selectedTime === 'Últimos 7 dias' && allIncidents.length > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(i => new Date(i.data) >= sevenDaysAgo);
    }

    if (selectedMarkets.length > 0) {
      filtered = filtered.filter(i => selectedMarkets.includes(i.mercado));
    }

    if (selectedGroups.length > 0) {
      filtered = filtered.filter(i => selectedGroups.includes(i.grupo));
    }

    if (selectedStatuses.length > 0 && selectedStatuses.length < 2) {
      const s = selectedStatuses[0];
      if (s === 'Pendentes') {
        filtered = filtered.filter(i => !i.dataPrev);
      } else if (s === 'Tratadas') {
        filtered = filtered.filter(i => !!i.dataPrev);
      }
    }

    return calculateMetrics(filtered);
  }, [allIncidents, selectedTime, selectedMarkets, selectedStatuses, selectedGroups]);

  // Filtered SGO Metrics with filters applied
  const filteredSgoMetrics = useMemo(() => {
    console.log('📊 [SGO Metrics] Calculating from incidents:', {
      count: sgoIncidents.length,
      sample: sgoIncidents[0] || 'No incidents'
    });

    let filtered = [...sgoIncidents];

    // Date filter
    if (sgoSelectedTime !== 'Tudo') {
      const now = new Date();
      const filterDate = new Date();

      if (sgoSelectedTime === 'Hoje') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (sgoSelectedTime === 'Ontem') {
        filterDate.setDate(now.getDate() - 1);
        filterDate.setHours(0, 0, 0, 0);
      } else if (sgoSelectedTime === '7 dias') {
        filterDate.setDate(now.getDate() - 7);
      } else if (sgoSelectedTime === '1 mês') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(i => {
        const incidentDate = new Date(i.dataInicio);
        return incidentDate >= filterDate;
      });
    }

    // Rede filter (nm_cat_prod2 -> rede field)
    if (sgoSelectedRedes.length > 0) {
      filtered = filtered.filter(i => sgoSelectedRedes.includes(i.rede));
    }

    // Status filter
    if (sgoSelectedStatuses.length > 0 && sgoSelectedStatuses.length < 2) {
      const status = sgoSelectedStatuses[0];
      if (status === 'Pendentes') {
        filtered = filtered.filter(i => {
          const s = i.acionado?.toLowerCase() || '';
          return s.includes('novo') || s.includes('pendente');
        });
      } else if (status === 'Tratadas') {
        filtered = filtered.filter(i => {
          const s = i.acionado?.toLowerCase() || '';
          return s.includes('designado') || s.includes('progresso');
        });
      }
    }

    // Grupo filter
    if (sgoSelectedGrupos.length > 0) {
      filtered = filtered.filter(i => sgoSelectedGrupos.includes(i.grupo));
    }

    // Cluster filter
    if (sgoSelectedClusters.length > 0) {
      filtered = filtered.filter(i => sgoSelectedClusters.includes(i.cluster));
    }

    const metrics = calculateSgoMetrics(filtered);
    console.log('📊 [SGO Metrics] Calculated:', metrics);
    return metrics;
  }, [sgoIncidents, sgoSelectedTime, sgoSelectedRedes, sgoSelectedStatuses, sgoSelectedGrupos, sgoSelectedClusters]);


  const availableMarkets = useMemo(() => {
    return Array.from(new Set(allIncidents.map(i => i.mercado))).sort();
  }, [allIncidents]);

  const availableStatuses = ['Pendentes', 'Tratadas'];

  const availableGroups = useMemo(() => {
    return Array.from(new Set(allIncidents.map(i => i.grupo))).sort();
  }, [allIncidents]);

  // SGO Filter Options
  const sgoAvailableRedes = useMemo(() => {
    return Array.from(new Set(sgoIncidents.map(i => i.rede).filter(Boolean))).sort();
  }, [sgoIncidents]);

  const sgoAvailableGrupos = useMemo(() => {
    return Array.from(new Set(sgoIncidents.map(i => i.grupo).filter(Boolean))).sort();
  }, [sgoIncidents]);

  const sgoAvailableClusters = useMemo(() => {
    return Array.from(new Set(sgoIncidents.map(i => i.cluster).filter(Boolean))).sort();
  }, [sgoIncidents]);

  const sgoAvailableStatuses = ['Pendentes', 'Tratadas'];
  const sgoTimeOptions = ['Tudo', 'Hoje', 'Ontem', '7 dias', '1 mês'];


  if (loading && allIncidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold animate-pulse">Sincronizando com a API...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Painel Operacional</p>
            <span className="bg-success/20 text-success text-[10px] font-black px-1.5 py-0.5 rounded border border-success/20 animate-pulse">LIVE</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
        </div>

        {/* Tab Switcher */}


        <div className="flex items-center gap-6">
          {/* Neighbors / Other Users Stack */}
          {onlineUsers.filter(u => u.id !== session?.user?.id).length > 0 && (
            <div className="hidden md:flex items-center -space-x-3">
              {onlineUsers
                .filter(u => u.id !== session?.user?.id)
                .slice(0, 3)
                .map((user, i) => (
                  <div key={user.id || i} className="group relative">
                    <div className="h-10 w-10 rounded-full border-2 border-background-dark ring-2 ring-white/5 bg-surface-dark flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="h-full w-full object-cover" alt={user.name} />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                      {user.name}
                    </div>
                  </div>
                ))}
              {onlineUsers.filter(u => u.id !== session?.user?.id).length > 3 && (
                <div className="h-10 w-10 rounded-full bg-surface-dark border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-gray-400 z-10">
                  +{onlineUsers.filter(u => u.id !== session?.user?.id).length - 3}
                </div>
              )}
            </div>
          )}

          {/* Current User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Conectado como</span>
              <span className="text-xs font-bold text-white">{session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}</span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-primary ring-2 ring-primary/20 bg-surface-dark flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`} className="h-full w-full object-cover" alt="me" />
            </div>
          </div>
          <button className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/5">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>
      </header>


      {/* SGO VIEW */}
      {
        activeTab === 'sgo' && (
          <>
            {/* SGO Filters */}
            <div className="flex flex-wrap gap-3 py-2 relative z-50">
              {/* Date Filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowSgoTimeDropdown(!showSgoTimeDropdown); setShowSgoRedeDropdown(false); setShowSgoStatusDropdown(false); setShowSgoGrupoDropdown(false); setShowSgoClusterDropdown(false); }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${sgoSelectedTime !== 'Tudo' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-300'}`}
                >
                  {sgoSelectedTime} <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                </button>
                {showSgoTimeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2">
                    {sgoTimeOptions.map(t => (
                      <button
                        key={t}
                        onClick={() => { setSgoSelectedTime(t); setShowSgoTimeDropdown(false); }}
                        className="w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rede Filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowSgoRedeDropdown(!showSgoRedeDropdown); setShowSgoTimeDropdown(false); setShowSgoStatusDropdown(false); setShowSgoGrupoDropdown(false); setShowSgoClusterDropdown(false); }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${sgoSelectedRedes.length > 0 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-300'}`}
                >
                  Rede: {sgoSelectedRedes.length > 0 ? sgoSelectedRedes.join(', ') : 'Todas'} <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                </button>
                {showSgoRedeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
                    {sgoAvailableRedes.map(r => (
                      <button
                        key={r}
                        onClick={() => setSgoSelectedRedes(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${sgoSelectedRedes.includes(r) ? 'text-primary font-bold' : 'text-gray-300'}`}
                      >
                        {sgoSelectedRedes.includes(r) && <span className="material-symbols-outlined text-base">check</span>}
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowSgoStatusDropdown(!showSgoStatusDropdown); setShowSgoTimeDropdown(false); setShowSgoRedeDropdown(false); setShowSgoGrupoDropdown(false); setShowSgoClusterDropdown(false); }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${sgoSelectedStatuses.length > 0 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-300'}`}
                >
                  Status: {sgoSelectedStatuses.length > 0 ? sgoSelectedStatuses.join(', ') : 'Todos'} <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                </button>
                {showSgoStatusDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2">
                    {sgoAvailableStatuses.map(s => (
                      <button
                        key={s}
                        onClick={() => setSgoSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${sgoSelectedStatuses.includes(s) ? 'text-primary font-bold' : 'text-gray-300'}`}
                      >
                        {sgoSelectedStatuses.includes(s) && <span className="material-symbols-outlined text-base">check</span>}
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grupo Filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowSgoGrupoDropdown(!showSgoGrupoDropdown); setShowSgoTimeDropdown(false); setShowSgoRedeDropdown(false); setShowSgoStatusDropdown(false); setShowSgoClusterDropdown(false); }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${sgoSelectedGrupos.length > 0 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-300'}`}
                >
                  Grupo: {sgoSelectedGrupos.length > 0 ? `${sgoSelectedGrupos.length} selecionado(s)` : 'Todos'} <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                </button>
                {showSgoGrupoDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
                    {sgoAvailableGrupos.map(g => (
                      <button
                        key={g}
                        onClick={() => setSgoSelectedGrupos(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${sgoSelectedGrupos.includes(g) ? 'text-primary font-bold' : 'text-gray-300'}`}
                      >
                        {sgoSelectedGrupos.includes(g) && <span className="material-symbols-outlined text-base">check</span>}
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cluster Filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowSgoClusterDropdown(!showSgoClusterDropdown); setShowSgoTimeDropdown(false); setShowSgoRedeDropdown(false); setShowSgoStatusDropdown(false); setShowSgoGrupoDropdown(false); }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${sgoSelectedClusters.length > 0 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-300'}`}
                >
                  Cluster: {sgoSelectedClusters.length > 0 ? `${sgoSelectedClusters.length} selecionado(s)` : 'Todos'} <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                </button>
                {showSgoClusterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
                    {sgoAvailableClusters.map(c => (
                      <button
                        key={c}
                        onClick={() => setSgoSelectedClusters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${sgoSelectedClusters.includes(c) ? 'text-primary font-bold' : 'text-gray-300'}`}
                      >
                        {sgoSelectedClusters.includes(c) && <span className="material-symbols-outlined text-base">check</span>}
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-surface-dark rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[120px] text-white">analytics</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-400">Total Ocorrências</p>
                    <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">+Real Time</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black text-white tracking-tighter">{filteredSgoMetrics.total.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 font-medium">Atualizado agora</span>
                  </div>
                </div>
              </div>
              <div className="col-span-6 lg:col-span-2 bg-surface-dark rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  <p className="text-sm font-bold text-gray-400">Pendentes</p>
                </div>
                <p className="text-4xl font-black text-primary">{filteredSgoMetrics.pending}</p>
                <p className="text-xs text-gray-500 mt-2">Aguardando Tratativa</p>
              </div>
              <div className="col-span-6 lg:col-span-2 bg-surface-dark rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-success text-base filled">check_circle</span>
                  <p className="text-sm font-bold text-gray-400">Tratadas</p>
                </div>
                <p className="text-4xl font-black text-white">{filteredSgoMetrics.treated}</p>
                <p className="text-xs text-gray-500 mt-2">{filteredSgoMetrics.efficiency} eficiência</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 bg-surface-dark rounded-3xl p-8 border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white">Evolução Temporal</h2>
                  <div className="bg-background-dark p-1 rounded-xl flex gap-1">
                    <button className="px-4 py-1.5 rounded-lg bg-surface-dark text-white text-xs font-bold shadow-lg">24h</button>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredSgoMetrics.evolutionData}>
                      <defs>
                        <linearGradient id="colorValSgo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e0062e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#e0062e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="time" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#e0062e" strokeWidth={3} fillOpacity={1} fill="url(#colorValSgo)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-surface-dark rounded-3xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-8">Top Cidades ({'>'} 24h)</h2>
                <div className="space-y-6">
                  {filteredSgoMetrics.techData.map((tech, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gray-400">{tech.name}</span>
                        <span className="text-white">{tech.value}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full shadow-lg"
                          style={{ width: `${tech.value}%`, backgroundColor: tech.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix */}
            {/* Matrix */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-white">Matriz de Ofensores: Pendentes</h2>
              <div className="overflow-x-auto rounded-3xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-dark border-b border-white/5">
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-left">Ranking</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-left">Cidade</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Total</th>
                      <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-left">Categoria Operacional</th>
                      {(filteredSgoMetrics.topCities?.[0]?.stats || []).map((stat, i) => (
                        <th key={i} className="p-4 text-[10px] font-black text-gray-600 uppercase tracking-widest text-center hidden md:table-cell max-w-[100px] truncate" title={stat.name}>
                          {stat.name.split(':')[1] || stat.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-surface-dark/50">
                    {(filteredSgoMetrics.topCities || []).map((city, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${idx < 3 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>#{idx + 1}</span>
                        </td>
                        <td className="p-4 font-bold text-gray-300 group-hover:text-white transition-colors">{city.name}</td>
                        <td className="p-4 text-center font-black text-white">{city.value}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]" title={city.topFailure}>{city.topFailure}</span>
                            <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${city.stats.find(s => s.name === city.topFailure)?.percent || 0}%` }}></div>
                            </div>
                          </div>
                        </td>
                        {city.stats.map((stat, i) => (
                          <td key={i} className="p-4 text-center hidden md:table-cell">
                            {stat.count > 0 ? (
                              <span className="text-xs font-bold text-gray-400" title={`${stat.count} (${stat.percent}%)`}>
                                {stat.count}
                              </span>
                            ) : (
                              <span className="text-gray-800 text-[10px]">â€¢</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )
      }
    </div >
  );
};

