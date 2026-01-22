import React from 'react';
import { Card } from '../../../components/ui/Card';

interface KPIGridProps {
    metrics: {
        total: number;
        pending: number;
        treated: number;
        efficiency: string;
    };
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics }) => {
    return (
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
                        <span className="text-6xl font-black text-white tracking-tighter">{metrics.total.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 font-medium">Atualizado agora</span>
                    </div>
                </div>
            </div>

            <Card className="col-span-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    <p className="text-sm font-bold text-gray-400">Pendentes</p>
                </div>
                <p className="text-4xl font-black text-primary">{metrics.pending}</p>
                <p className="text-xs text-gray-500 mt-2">Aguardando Tratativa</p>
            </Card>

            <Card className="col-span-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-success text-base filled">check_circle</span>
                    <p className="text-sm font-bold text-gray-400">Tratadas</p>
                </div>
                <p className="text-4xl font-black text-white">{metrics.treated}</p>
                <p className="text-xs text-gray-500 mt-2">{metrics.efficiency} eficiência</p>
            </Card>
        </div>
    );
};
