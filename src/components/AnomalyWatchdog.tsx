import React, { useEffect, useState } from 'react';
import { fetchAnomalies, AnomalyAlert } from '../apiService';

export const AnomalyWatchdog: React.FC = () => {
    const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await fetchAnomalies();
            setAlerts(data);
            setLoading(false);
        };
        load();

        // Poll every 5 minutes
        const interval = setInterval(load, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading || alerts.length === 0) return null;

    return (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`
                        p-4 rounded-lg shadow-xl border-l-4 backdrop-blur-md animate-slide-in-right transform transition-all duration-300 hover:scale-105
                        ${alert.severity === 'HIGH'
                            ? 'bg-red-900/80 border-red-500 text-white'
                            : 'bg-yellow-900/80 border-yellow-500 text-white'}
                    `}
                >
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-2xl animate-pulse">
                            {alert.severity === 'HIGH' ? 'notification_important' : 'warning'}
                        </span>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                {alert.target_type}: {alert.target_name}
                                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">
                                    {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </h4>
                            <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
