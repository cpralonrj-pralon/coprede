import React, { useState } from 'react';
import { RecurrenceCharts } from '../components/RecurrenceCharts';
import { RecurrenceUpload } from '../components/RecurrenceUpload';
import { RecurrenceFilters } from '../components/RecurrenceFilters';

export const Recurrence: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [filters, setFilters] = useState({});

    return (
        <div className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Painel de Reincidência</h1>
                <p className="text-gray-400 font-medium">Análise de falhas repetitivas (NAPs e Nodes)</p>
            </header>

            <RecurrenceUpload onUploadComplete={() => setRefreshTrigger(prev => prev + 1)} />

            <RecurrenceFilters filters={filters} onChange={setFilters} />

            <RecurrenceCharts refreshTrigger={refreshTrigger} filters={filters} />
        </div>
    );
};
