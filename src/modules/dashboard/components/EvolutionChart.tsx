import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../../components/ui/Card';

interface EvolutionChartProps {
    data: { time: string; val: number }[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
    return (
        <Card className="col-span-12 lg:col-span-7 h-96" padding="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Evolução Temporal</h2>
                <div className="bg-background-dark p-1 rounded-xl flex gap-1">
                    <button className="px-4 py-1.5 rounded-lg bg-surface-dark text-white text-xs font-bold shadow-lg">24h</button>
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValSgo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#e0062e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#e0062e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis dataKey="time" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="val" stroke="#e0062e" strokeWidth={3} fillOpacity={1} fill="url(#colorValSgo)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
