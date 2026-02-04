
import React, { useState } from 'react';
import { MonitorTable } from '../components/MonitorTable';
import { useApp } from '../context/AppContext';

interface MonitorProps {
    onBack: () => void;
}

export const Monitor: React.FC<MonitorProps> = ({ onBack }) => {
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
    const { setView, setSelectedIncidentId } = useApp();

    const handleIncidentSelect = (incident: any) => {
        if (incident) {
            setSelectedIncidentId(String(incident.ticket));
            setView('incident_detail');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="h-10 w-10 rounded-xl bg-background-dark flex items-center justify-center text-white border border-white/5 hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Monitor de Rede</h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-0.5">Visão Unificada: NewMonitor & SGO</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success animate-ping" />
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Live Connect</span>
                </div>
            </header>

            {/* Main Content - Full Width Table */}
            <div className="w-full space-y-4">
                <div className="flex justify-end gap-2 px-2">
                    <button className="h-8 px-3 rounded-lg bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-tighter hover:bg-white/10 transition-all border border-white/5">Exportar CSV</button>
                    <button className="h-8 px-3 rounded-lg bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter hover:bg-primary/20 transition-all border border-primary/20">Filtro Avançado</button>
                </div>
                <MonitorTable onSelect={handleIncidentSelect} />
            </div>
        </div>
    );
};
