import React from 'react';
import { Card } from '../../../components/ui/Card';

interface TopCitiesChartProps {
    data: { name: string; value: number; color: string }[];
}

export const TopCitiesChart: React.FC<TopCitiesChartProps> = ({ data }) => {
    return (
        <Card className="col-span-12 lg:col-span-5" padding="p-8">
            <h2 className="text-xl font-bold text-white mb-8">Top Cidades ({'>'} 24h)</h2>
            <div className="space-y-6">
                {data.map((tech, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="text-gray-400">{tech.name}</span>
                            <span className="text-white">{tech.value}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full shadow-lg"
                                style={{ width: `${tech.value}%`, backgroundColor: tech.color }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
