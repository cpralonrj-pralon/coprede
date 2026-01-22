import React from 'react';
import { Select } from '../../../components/ui/Select';

interface DashboardFiltersProps {
    filters: {
        time: string;
        redes: string[];
        statuses: string[];
        grupos: string[];
        clusters: string[];
    };
    options: {
        times: string[];
        redes: string[];
        statuses: string[];
        grupos: string[];
        clusters: string[];
    };
    onFilterChange: (key: string, value: any) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, options, onFilterChange }) => {
    return (
        <div className="flex flex-wrap gap-3 py-2 relative z-50">
            <Select
                value={filters.time}
                options={options.times}
                onChange={(v) => onFilterChange('time', v)}
                icon="calendar_today"
            />
            <Select
                label="Rede"
                value={filters.redes}
                options={options.redes}
                onChange={(v) => onFilterChange('redes', v)}
                multiple
            />
            <Select
                label="Status"
                value={filters.statuses}
                options={options.statuses}
                onChange={(v) => onFilterChange('statuses', v)}
                multiple
            />
            <Select
                label="Grupo"
                value={filters.grupos}
                options={options.grupos}
                onChange={(v) => onFilterChange('grupos', v)}
                multiple
            />
            <Select
                label="Cluster"
                value={filters.clusters}
                options={options.clusters}
                onChange={(v) => onFilterChange('clusters', v)}
                multiple
            />
        </div>
    );
};
