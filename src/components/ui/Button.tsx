import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    ...props
}) => {
    const baseStyles = 'rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary border border-primary text-white shadow-lg shadow-primary/20 hover:brightness-110',
        secondary: 'bg-surface-dark border border-white/5 text-gray-300 hover:text-white hover:bg-white/5',
        ghost: 'bg-transparent text-gray-400 hover:text-white'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
            {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
        </button>
    );
};
