import React, { useEffect, useState } from 'react';
import { supabase } from '../apiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';

interface RecurrenceChartsProps {
    refreshTrigger?: number;
    filters?: any;
}

export const RecurrenceCharts = ({ refreshTrigger = 0, filters = {} }: RecurrenceChartsProps) => {
    const [topOffenders, setTopOffenders] = useState<any[]>([]);
    const [resolutions, setResolutions] = useState<any[]>([]);
    const [dailyTrend, setDailyTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        // Merge date range into filters
        const activeFilters = { ...filters };
        if (dateRange.start) activeFilters.dt_inicio = dateRange.start;
        if (dateRange.end) activeFilters.dt_fim = dateRange.end;

        fetchData(activeFilters);
    }, [refreshTrigger, filters, dateRange]);

    const fetchData = async (activeFilters: any) => {
        setLoading(true);

        // Use RPC with filters
        const { data, error } = await supabase.rpc('get_recurrence_dashboard_data', {
            p_filters: activeFilters
        });

        if (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
            return;
        }

        if (data) {
            setTopOffenders(data.top_offenders || []);
            setResolutions(data.resolutions || []);
            setDailyTrend(data.daily_trend || []);
        }

        setLoading(false);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="flex flex-col gap-6">
            {/* Local Filters Row */}
            <div className="flex gap-4 items-end bg-surface-dark border border-white/5 p-4 rounded-xl">
                <div className="flex flex-col gap-1">
                    <label htmlFor="date-start" className="text-xs text-gray-400 font-bold uppercase">Início</label>
                    <input
                        id="date-start"
                        aria-label="Data Início"
                        type="date"
                        className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:border-primary focus:outline-none"
                        value={dateRange.start}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="date-end" className="text-xs text-gray-400 font-bold uppercase">Fim</label>
                    <input
                        id="date-end"
                        aria-label="Data Fim"
                        type="date"
                        className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:border-primary focus:outline-none"
                        value={dateRange.end}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>
                <div className="text-xs text-gray-500 pb-2">
                    * Filtre para remover dados antigos (2025)
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center text-gray-500 animate-pulse">
                    Carregando gráficos atualizados...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart 1: Top Offenders */}
                    <div className="bg-surface-dark border border-white/5 rounded-3xl p-6 h-[500px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">🏆 Top 100 Ofensores (Nodes)</h3>
                        <div className="flex-1 w-full min-h-0">
                            {topOffenders.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={topOffenders} margin={{ left: 50, right: 20, bottom: 20 }}>
                                        <XAxis type="number" stroke="#666" />
                                        <YAxis dataKey="node" type="category" width={80} stroke="#999" fontSize={11} tick={{ fill: '#9eaabb' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="total_incidentes" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                                            {topOffenders.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <span className="material-symbols-outlined text-4xl">bar_chart_off</span>
                                    <p>Sem dados para os filtros selecionados</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart 2: Causes (Previously Resolutions) */}
                    <div className="bg-surface-dark border border-white/5 rounded-3xl p-6 h-[500px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">🧩 Distribuição por Causa (Cat. 3)</h3>
                        <div className="flex-1 w-full min-h-0">
                            {resolutions.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={resolutions} margin={{ left: 50, right: 20, bottom: 20 }}>
                                        <XAxis type="number" stroke="#666" />
                                        <YAxis dataKey="ds_resolucao" type="category" width={150} stroke="#999" fontSize={11} tick={{ fill: '#9eaabb' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="total" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={20}>
                                            {resolutions.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <span className="material-symbols-outlined text-4xl">bar_chart_off</span>
                                    <p>Sem dados de causa</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Chart 3: Daily Trend (Dual Axis) */}
                    <div className="md:col-span-2 bg-surface-dark border border-white/5 rounded-3xl p-6 h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">📈 Evolução Diária (Volume x Reincidência)</h3>
                        <div className="flex-1 w-full min-h-0">
                            {dailyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={dailyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="data_dia"
                                            stroke="#666"
                                            tickFormatter={(str) => {
                                                if (!str) return '';
                                                const parts = str.split('-');
                                                if (parts.length === 3) {
                                                    const day = parts[2];
                                                    const month = parts[1];
                                                    return `${day}/${month}`;
                                                }
                                                return str;
                                            }}
                                        />
                                        {/* Primary Axis: Total Incidents (Bars) */}
                                        <YAxis yAxisId="left" stroke="#8884d8" fontSize={12} orientation="left" />

                                        {/* Secondary Axis: Recurrence Percentage (Line) */}
                                        <YAxis yAxisId="right" stroke="#ff7300" fontSize={12} orientation="right" unit="%" domain={[0, 100]} />

                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelFormatter={(label) => {
                                                const d = new Date(label);
                                                return d.toLocaleDateString('pt-BR');
                                            }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />

                                        <Bar yAxisId="left" dataKey="total" name="Incidentes" fill="url(#colorTotal)" barSize={40} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="recurrence_rate" name="% Reincidência" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <span className="material-symbols-outlined text-4xl">show_chart</span>
                                    <p>Sem dados de evolução</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
