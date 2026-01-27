import React, { useEffect, useState } from 'react';
import { supabase } from '../apiService';

interface FilterState {
    nm_tipo?: string;
    tp_abrangencia?: string;
    nm_organizacao_abertura?: string;
    fc_mdu?: string;
    ds_cat_prod2?: string;
    ds_cat_prod3?: string;
    ds_cat_oper2?: string;
    ds_fecha_cat_prod2?: string;
    nm_cidade?: string;
    ci_estado?: string;
}

interface RecurrenceFiltersProps {
    filters: FilterState;
    onChange: (newFilters: FilterState) => void;
}

export const RecurrenceFilters = ({ filters, onChange }: RecurrenceFiltersProps) => {
    // Dynamic Options
    const [options, setOptions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);

    // Fields to filter
    const fields = [
        { key: 'nm_cidade', label: 'Cidade' },
        { key: 'ci_estado', label: 'UF' },
        { key: 'nm_tipo', label: 'Tipo' },
        { key: 'tp_abrangencia', label: 'Abrangência' },
        { key: 'nm_organizacao_abertura', label: 'Org. Abertura' },
        { key: 'fc_mdu', label: 'MDU' },
        { key: 'ds_cat_prod2', label: 'Cat. Prod 2' },
        { key: 'ds_cat_prod3', label: 'Cat. Prod 3' },
        { key: 'ds_cat_oper2', label: 'Cat. Oper 2' },
        { key: 'ds_fecha_cat_prod2', label: 'Fecha. Cat. Prod' },
    ];

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        setLoading(true);
        const newOptions: Record<string, string[]> = {};

        // Parallel fetch for all fields
        await Promise.all(fields.map(async (field) => {
            const { data } = await supabase.rpc('get_recurrence_filter_options', { field_name: field.key });
            if (data) {
                newOptions[field.key] = data.map((d: any) => d.value || d[field.key]); // d.value is standard from RPC
            }
        }));

        setOptions(newOptions);
        setLoading(false);
    };

    const handleChange = (key: string, value: string) => {
        onChange({ ...filters, [key]: value || undefined });
    };

    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                Filtros
            </h3>

            {loading ? (
                <div className="text-gray-500 text-sm">Carregando filtros...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {fields.map((field) => (
                        <div key={field.key} className="flex flex-col">
                            <label className="text-xs text-gray-500 font-semibold mb-1 truncate" title={field.label}>{field.label}</label>
                            <select
                                className="bg-black/40 border border-white/10 rounded-lg text-sm text-gray-300 py-1.5 px-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                value={filters[field.key as keyof FilterState] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            >
                                <option value="">Todos</option>
                                {options[field.key]?.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Filters Summary / Clear Button */}
            {Object.values(filters).some(Boolean) && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onChange({})}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        Limpar Filtros
                    </button>
                </div>
            )}
        </div>
    );
};
