import React from 'react';
import { Card } from '../../../components/ui/Card';

interface QRTBreakdownCardProps {
    total: number;
    byGroup: { name: string; value: number }[];
}

export const QRTBreakdownCard: React.FC<QRTBreakdownCardProps> = ({ total, byGroup }) => {
    return (
        <Card className="h-full bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border border-orange-500/30 overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full group-hover:bg-orange-500/30 transition-all"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse">
                    <span className="material-symbols-outlined text-orange-500 text-xl">warning_amber</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white leading-none">Monitoramento QRT</h3>
                    <p className="text-xs text-orange-400 font-medium mt-1">Suspeita de Queda (Motor Técnico)</p>
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{total}</span>
                    <span className="text-sm text-gray-400">ocorrências ativas</span>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {byGroup.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-transparent hover:border-orange-500">
                            <span className="text-sm text-gray-300 font-medium w-3/4 truncate">{item.name}</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full"
                                        style={{ width: `${Math.min((item.value / total) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-white min-w-[20px] text-right">{item.value}</span>
                            </div>
                        </div>
                    ))}
                    {byGroup.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-4">Nenhuma suspeita detectada.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};
