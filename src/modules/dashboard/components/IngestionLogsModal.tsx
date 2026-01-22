import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Reusing existing client or creating a local one for simplicity if not exported globally
// Ideally should use the global one. Assuming 'database' module approach or passing prop.
// For now, I'll assume we can get it from window or context, but safely I will use the .env to create a lightweight client just for this modal or expect it passed.
// Better: Use the same `supabase` instance as the rest of the app.
import { supabase } from '../../../apiService';

interface LogEntry {
    id: string;
    source: string;
    status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
    batch_size: number;
    inserted: number;
    updated: number;
    errors: number;
    executed_at: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const IngestionLogsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ingestion_logs')
            .select('*')
            .order('executed_at', { ascending: false })
            .limit(50);

        if (data) setLogs(data);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-[#1e293b] rounded-lg shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0f172a] rounded-t-lg">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        📜 Logs de Ingestão (Últimos 50)
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="p-0 overflow-auto flex-1">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Carregando logs...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-[#0f172a] sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Data/Hora</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Batch</th>
                                    <th className="px-4 py-3 text-right">Inseridos</th>
                                    <th className="px-4 py-3 text-right">Atualizados</th>
                                    <th className="px-4 py-3 text-right">Erros</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-300">
                                            {new Date(log.executed_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                                                log.status === 'PARTIAL' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                                                    'bg-red-900/50 text-red-400 border border-red-800'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-white">{log.batch_size}</td>
                                        <td className="px-4 py-3 text-right text-green-400">+{log.inserted}</td>
                                        <td className="px-4 py-3 text-right text-blue-400">~{log.updated}</td>
                                        <td className="px-4 py-3 text-right text-red-400">{log.errors > 0 ? `! ${log.errors}` : '-'}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            Nenhum log de ingestão encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-[#0f172a] rounded-b-lg flex justify-end">
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                        Atualizar
                    </button>
                </div>
            </div>
        </div>
    );
};
