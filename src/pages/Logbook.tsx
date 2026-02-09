import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LogbookEntry {
    id: string;
    titulo: string;
    data: string;
    horario: string;
    categoria: string;
    descricao: string;
    impacto?: string;
    status: string;
    created_at: string;
}

interface Analytics {
    total: number;
    byDay: Array<{ date: string; count: number }>;
    byMonth: Array<{ month: string; count: number }>;
    byCategory: Array<{ categoria: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export const Logbook: React.FC = () => {
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCharts, setShowCharts] = useState(true);
    const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
    const [categoriaFilter, setCategoriaFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [formData, setFormData] = useState({
        titulo: '',
        data: new Date().toISOString().split('T')[0],
        horario: new Date().toTimeString().split(' ')[0].substring(0, 5),
        categoria: '',
        descricao: '',
        impacto: '',
        status: 'Aberto'
    });

    const categorias = ['SGO', 'Sistema', 'Rede', 'Ferramentas', 'Infraestrutura', 'Outro'];
    const statusOptions = ['Aberto', 'Em Análise', 'Resolvido'];

    useEffect(() => {
        console.log('Logbook API_URL:', API_URL);
        loadData();
    }, [categoriaFilter, statusFilter]);

    const loadData = async () => {
        await Promise.all([loadEntries(), loadAnalytics()]);
    };

    const loadEntries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (categoriaFilter) params.append('categoria', categoriaFilter);
            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`${API_URL}/logbook?${params.toString()}`);
            const data = await response.json();
            setEntries(data);
        } catch (error) {
            console.error('Erro ao carregar registros:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/logbook/analytics`);
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingEntry
                ? `${API_URL}/logbook/${editingEntry.id}`
                : `${API_URL}/logbook`;

            const method = editingEntry ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                loadData();
                resetForm();
            }
        } catch (error) {
            console.error('Erro ao salvar registro:', error);
        }
    };

    const handleEdit = (entry: LogbookEntry) => {
        setEditingEntry(entry);
        setFormData({
            titulo: entry.titulo,
            data: entry.data,
            horario: entry.horario,
            categoria: entry.categoria,
            descricao: entry.descricao,
            impacto: entry.impacto || '',
            status: entry.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este registro?')) return;

        try {
            const response = await fetch(`${API_URL}/logbook/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Erro ao excluir registro:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingEntry(null);
        setFormData({
            titulo: '',
            data: new Date().toISOString().split('T')[0],
            horario: new Date().toTimeString().split(' ')[0].substring(0, 5),
            categoria: '',
            descricao: '',
            impacto: '',
            status: 'Aberto'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-red-500/20 text-red-400';
            case 'Em Análise': return 'bg-yellow-500/20 text-yellow-400';
            case 'Resolvido': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const formatMonthLabel = (month: string) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${monthNames[parseInt(monthNum) - 1]}/${year}`;
    };

    return (
        <div className="min-h-screen bg-background-dark p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Diário de Bordo</h1>
                        <p className="text-gray-400">Registro de incidentes operacionais</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCharts(!showCharts)}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
                        >
                            <span className="material-symbols-outlined">
                                {showCharts ? 'visibility_off' : 'analytics'}
                            </span>
                            {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">add</span>
                            {showForm ? 'Cancelar' : 'Novo Registro'}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                    <select
                        aria-label="Filtrar por Categoria"
                        value={categoriaFilter}
                        onChange={(e) => setCategoriaFilter(e.target.value)}
                        className="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                    >
                        <option value="">Todas as Categorias</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        aria-label="Filtrar por Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                    >
                        <option value="">Todos os Status</option>
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analytics Charts */}
            {showCharts && analytics && (
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Incidentes por Dia */}
                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">timeline</span>
                            Incidentes por Dia
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics.byDay.slice(-14)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    itemStyle={{ color: '#7C3AED' }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                                />
                                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Incidentes por Mês */}
                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            Incidentes por Mês
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.byMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={formatMonthLabel}
                                />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    itemStyle={{ color: '#7C3AED' }}
                                    labelFormatter={(value) => formatMonthLabel(String(value))}
                                />
                                <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Incidentes por Categoria */}
                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">category</span>
                            Incidentes por Categoria
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    nameKey="categoria"
                                    label={({ categoria, percent }: any) => `${categoria} (${((percent || 0) * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {analytics.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#7C3AED' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Incidentes por Status */}
                    <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">assignment</span>
                            Distribuição por Status
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.byStatus} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis type="category" dataKey="status" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#7C3AED' }}
                                />
                                <Bar dataKey="count" fill="#EC4899" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="mb-8 bg-surface-dark border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {editingEntry ? 'Editar Registro' : 'Novo Registro'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="logbook-titulo" className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                            <input
                                id="logbook-titulo"
                                type="text"
                                required
                                maxLength={200}
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ex: Lentidão no SGO"
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="logbook-data" className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                            <input
                                id="logbook-data"
                                type="date"
                                required
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="logbook-horario" className="block text-sm font-medium text-gray-300 mb-2">Horário</label>
                            <input
                                id="logbook-horario"
                                type="time"
                                required
                                value={formData.horario}
                                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="logbook-categoria" className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                            <select
                                id="logbook-categoria"
                                required
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            >
                                <option value="">Selecione...</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="logbook-status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                                id="logbook-status"
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="logbook-descricao" className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                            <textarea
                                id="logbook-descricao"
                                required
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Descreva o problema detalhadamente..."
                                rows={3}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="logbook-impacto" className="block text-sm font-medium text-gray-300 mb-2">Impacto</label>
                            <textarea
                                id="logbook-impacto"
                                value={formData.impacto}
                                onChange={(e) => setFormData({ ...formData, impacto: e.target.value })}
                                placeholder="Descreva o impacto no operacional..."
                                rows={2}
                                className="w-full px-4 py-2 bg-background-dark border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-primary rounded-lg text-white font-semibold hover:bg-primary/90 transition-all"
                            >
                                {editingEntry ? 'Atualizar' : 'Salvar'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-white/5 rounded-lg text-gray-400 font-semibold hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Entries List */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-4">Registros Recentes</h2>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">book</span>
                    <p>Nenhum registro encontrado</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{entry.titulo}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            {new Date(entry.data).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {entry.horario.substring(0, 5)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">category</span>
                                            {entry.categoria}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-300 mb-1">Descrição:</p>
                                    <p className="text-gray-400">{entry.descricao}</p>
                                </div>
                                {entry.impacto && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-300 mb-1">Impacto:</p>
                                        <p className="text-gray-400">{entry.impacto}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
