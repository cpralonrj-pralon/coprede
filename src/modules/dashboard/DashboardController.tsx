import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardFilters } from './components/DashboardFilters';
import { KPIGrid } from './components/KPIGrid';
import { EvolutionChart } from './components/EvolutionChart';
import { TopCitiesChart } from './components/TopCitiesChart';
import { OffenderMatrix } from './components/OffenderMatrix';
import { IncidentMap } from '../../components/ui/IncidentMap';
import { Button } from '../../components/ui/Button';
import { IngestionLogsModal } from './components/IngestionLogsModal';

export const DashboardController: React.FC = () => {
    const { session } = useAuth();
    const {
        loading,
        error,
        sgoMetrics,
        sgoFilters,
        setSgoFilters,
        options,
        refresh,
        incidents
    } = useDashboardData();

    // Logs Modal State
    const [showLogs, setShowLogs] = useState(false);

    const handleFilterChange = (key: string, value: any) => {
        setSgoFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse">Sincronizando com a API...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <Button onClick={refresh}>Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-[1920px] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Painel Operacional</p>
                        <span className="bg-success/20 text-success text-[10px] font-black px-1.5 py-0.5 rounded border border-success/20 animate-pulse">LIVE</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Conectado como</span>
                        <span className="text-xs font-bold text-white">{session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-primary ring-2 ring-primary/20 bg-surface-dark flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white">person</span>
                    </div>
                </div>
            </header>

            {/* Filters Row with Logs Button */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center bg-[#0f172a] p-4 rounded-xl border border-gray-800 shadow-sm">
                <DashboardFilters
                    filters={sgoFilters}
                    options={options}
                    onFilterChange={handleFilterChange}
                />

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowLogs(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500 transition-all text-sm group"
                        title="Ver Logs de Ingestão"
                    >
                        <span className="group-hover:scale-110 transition-transform">📜</span>
                        <span className="hidden sm:inline font-medium">Logs de Sistema</span>
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <KPIGrid metrics={sgoMetrics} />

            {/* Map & Analytics Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 flex flex-col gap-4 min-h-[500px]">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Geolocalização</h3>
                    <div className="flex-1 w-full h-full">
                        <IncidentMap incidents={incidents} height="100%" />
                    </div>
                </div>

                <div className="xl:col-span-1 flex flex-col gap-6">
                    <EvolutionChart data={sgoMetrics.evolutionData} />
                    <TopCitiesChart data={sgoMetrics.techData} />
                </div>
            </div>

            {/* Matrix */}
            {/* Matrix - Now receiving full incident list */}
            <OffenderMatrix incidents={incidents} />

            {/* Modal de Logs */}
            <IngestionLogsModal isOpen={showLogs} onClose={() => setShowLogs(false)} />
        </div>
    );
};
