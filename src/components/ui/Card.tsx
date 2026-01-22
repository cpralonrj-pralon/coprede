import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-6' }) => {
    return (
        <div className={`bg-surface-dark rounded-3xl border border-white/5 ${padding} ${className}`}>
            {children}
        </div>
    );
};
