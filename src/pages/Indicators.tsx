import React from 'react';
import { RecurrenceCharts } from '../components/RecurrenceCharts';
import { AISummary } from '../components/AISummary';

export const Indicators = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            Painel de Reincidência
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Monitoramento inteligente de nodes ofensores e qualidade de rede
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Exportar Relatório
                    </button>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nova Análise
                    </button>
                </div>
            </div>

            {/* AI Analyst Widget - Premium Position */}
            <AISummary />

            {/* Main Charts Architecture */}
            <RecurrenceCharts />

        </div>
    );
};
