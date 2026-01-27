import React, { useEffect, useState } from 'react';
import { supabase } from '../apiService';

export const AISummary = () => {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestAnalysis();
    }, []);

    const fetchLatestAnalysis = async () => {
        try {
            const { data, error } = await supabase
                .from('ai_analyst_logs')
                .select('*')
                .eq('dashboard_type', 'recurrence')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setSummary(data.analysis_text);
            } else {
                // Fallback for demo if no data exists yet
                setSummary("Olá! Sou sua IA de Análise. Assim que você carregar dados e solicitar uma análise, vou destacar aqui os principais ofensores e tendências críticas da rede para agilizar sua tomada de decisão.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            {/* Animated Gradient Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur"></div>

            <div className="relative bg-[#0f172a] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">

                {/* Icon Section */}
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1">
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold text-lg mb-2 flex items-center gap-2">
                        COp Rede AI Analyst
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                    </h3>

                    {loading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-2 bg-slate-700 rounded"></div>
                                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {summary}
                        </p>
                    )}
                </div>

                {/* Actions (Optional) */}
                <div className="flex-shrink-0 self-center hidden md:block">
                    <button
                        className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                        onClick={fetchLatestAnalysis}
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Atualizar
                    </button>
                </div>
            </div>
        </div>
    );
};
