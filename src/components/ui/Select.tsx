import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
    label?: string;
    value: string | string[];
    options: string[];
    onChange: (value: any) => void;
    multiple?: boolean;
    placeholder?: string;
    icon?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    value,
    options,
    onChange,
    multiple = false,
    placeholder = 'Selecione',
    icon = 'keyboard_arrow_down'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(option)
                ? currentValues.filter(v => v !== option)
                : [...currentValues, option];
            onChange(newValue);
        } else {
            onChange(option);
            setIsOpen(false);
        }
    };

    const displayValue = () => {
        if (multiple) {
            const arr = Array.isArray(value) ? value : [];
            if (arr.length === 0) return placeholder;
            return `${arr.length} selecionado(s)`;
        }
        return value && value !== 'Tudo' ? value : placeholder;
    };

    const isActive = multiple ? (Array.isArray(value) && value.length > 0) : (value && value !== 'Tudo');

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${isActive
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-surface-dark border-white/5 text-gray-300'
                    }`}
            >
                {label && <span className="mr-1">{label}:</span>}
                {displayValue()}
                <span className="material-symbols-outlined text-base">{icon}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
                    {options.map((option) => {
                        const isSelected = multiple
                            ? (Array.isArray(value) && value.includes(option))
                            : value === option;

                        return (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={`w-full text-left px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${isSelected ? 'text-primary font-bold' : 'text-gray-300'
                                    }`}
                            >
                                {isSelected && <span className="material-symbols-outlined text-base">check</span>}
                                {option}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
