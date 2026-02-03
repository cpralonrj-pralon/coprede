import React, { useState } from 'react';
import { User } from '../types';

interface ShiftSchedulerProps {
    users: User[];
}

type ShiftType = 'morning' | 'afternoon' | 'night' | 'off';

interface Shift {
    type: ShiftType;
    label: string;
    time: string;
    color: string;
    icon?: string;
}

const SHIFT_TYPES: Record<ShiftType, Shift> = {
    morning: {
        type: 'morning',
        label: 'Manhã',
        time: '06:00 - 15:00',
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        icon: 'wb_sunny'
    },
    afternoon: {
        type: 'afternoon',
        label: 'Tarde',
        time: '14:00 - 23:00',
        color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        icon: 'wb_twilight'
    },
    night: {
        type: 'night',
        label: 'Noite',
        time: '22:00 - 06:00',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        icon: 'dark_mode'
    },
    off: {
        type: 'off',
        label: 'Folga',
        time: 'DSR',
        color: 'bg-gray-700/30 text-gray-400 border-gray-700/50',
        icon: 'weekend'
    }
};

export const ShiftScheduler: React.FC<ShiftSchedulerProps> = ({ users }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [shiftOverrides, setShiftOverrides] = useState<Record<string, ShiftType>>({});
    const [editingShift, setEditingShift] = useState<{ user: User, date: Date } | null>(null);

    // Generate days for the entire month
    const getDaysOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }).map((_, i) => {
            return new Date(year, month, i + 1);
        });
    };

    const monthDays = getDaysOfMonth(currentDate);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentDate(newDate);
    };

    // Mock function to determine shift based on user and date
    // In a real app, this would come from the DB or a complex rotation algorithm
    const getShiftForUser = (user: User, date: Date): Shift => {
        // Check for manual override first
        const overrideKey = `${user.id}_${date.toISOString().split('T')[0]}`;
        if (shiftOverrides[overrideKey]) {
            return SHIFT_TYPES[shiftOverrides[overrideKey]];
        }

        const day = date.getDate();
        const userIdSum = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Create a deterministic pseudo-random pattern based on User ID and Date
        // This simulates the 5x2 rotation for demo purposes
        const offset = userIdSum % 7;
        const dayIndex = (date.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

        // Simple mock rotation: 5 days work, 2 days off
        // We shift the "off" days based on user ID offset
        const cycleDay = (dayIndex + offset) % 7;

        if (cycleDay >= 5) {
            return SHIFT_TYPES.off;
        }

        // Assign shifts based on user role or random specific property
        // Example: Supervisors on Morning, Operators rotate
        if (user.role.includes('Supervisor')) return SHIFT_TYPES.morning;
        if (user.role.includes('NOC')) return SHIFT_TYPES.night;

        // Rotate shifts for others
        const shiftRotation = (day + offset) % 3;
        if (shiftRotation === 0) return SHIFT_TYPES.morning;
        if (shiftRotation === 1) return SHIFT_TYPES.afternoon;
        return SHIFT_TYPES.night;
    };

    const handleOverrideShift = (type: ShiftType) => {
        if (!editingShift) return;

        const key = `${editingShift.user.id}_${editingShift.date.toISOString().split('T')[0]}`;
        setShiftOverrides(prev => ({
            ...prev,
            [key]: type
        }));
        setEditingShift(null);
    };

    return (
        <>
            <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-xl animate-in fade-in duration-500 flex flex-col h-[800px]">
                {/* Header Controls */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151b2b]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">Escala Operacional</h2>
                    </div>

                    <div className="flex items-center gap-2 bg-[#0f131f] p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <span className="text-xs font-bold text-gray-300 px-4 min-w-[140px] text-center uppercase tracking-widest">
                            {monthDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => navigateMonth('next')}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Users Sidebar */}
                    <div className="w-[300px] flex-shrink-0 border-r border-white/5 flex flex-col bg-[#151b2b] z-20 shadow-xl">
                        {/* Header Spacer */}
                        <div className="h-[60px] border-b border-white/5 flex items-center px-6 bg-[#1a2133]">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Colaborador</span>
                        </div>

                        {/* User List */}
                        <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
                            {users.map((user) => (
                                <div key={user.id} className="h-[100px] border-b border-white/5 flex items-center px-6 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        {user.avatar ? (
                                            <img src={user.avatar} className="h-10 w-10 rounded-xl object-cover shadow-lg ring-2 ring-white/5" alt={user.name} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary font-black flex items-center justify-center text-sm ring-2 ring-white/5">
                                                {user.initials}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">{user.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-wider">{user.role}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                                <span className="text-[10px] text-gray-400">5x2 Rotativo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="flex-1 flex flex-col overflow-x-auto bg-[#0f131f]">
                        {/* Days Header */}
                        <div className="h-[60px] flex border-b border-white/5 min-w-max">
                            {monthDays.map((day) => {
                                const isToday = new Date().toDateString() === day.toDateString();
                                return (
                                    <div key={day.toISOString()} className={`flex-1 min-w-[140px] flex flex-col items-center justify-center border-r border-white/5 ${isToday ? 'bg-primary/5' : 'bg-[#1a2133]'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                                            {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                        </span>
                                        <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-bold text-sm ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-300'}`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Shifts Grid */}
                        <div className="flex-1 overflow-y-auto no-scrollbar min-w-max pb-4">
                            {users.map((user) => (
                                <div key={`grid-${user.id}`} className="flex h-[100px] border-b border-white/5 bg-[#0f131f]">
                                    {monthDays.map((day) => {
                                        const shift = getShiftForUser(user, day);
                                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                                        return (
                                            <div key={day.toISOString()} className={`flex-1 min-w-[140px] border-r border-white/5 p-2 flex items-center justify-center relative group`}>
                                                {/* Shift Card */}
                                                <div className={`w-full h-full rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden ${shift.color} ${isPast ? 'opacity-50 grayscale-[0.5]' : 'hover:scale-[0.98] hover:shadow-lg cursor-pointer'}`}>

                                                    {/* Background Glow */}
                                                    <div className={`absolute -top-10 -right-10 w-20 h-20 bg-current opacity-[0.05] rounded-full blur-2xl`}></div>

                                                    <div className="flex items-center gap-1.5 z-10">
                                                        <span className="material-symbols-outlined text-[18px]">{shift.icon}</span>
                                                        <span className="font-bold text-xs uppercase tracking-wider">{shift.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium opacity-80 bg-black/20 px-2 py-0.5 rounded-lg border border-white/5 z-10">
                                                        {shift.time}
                                                    </span>

                                                    {/* Hover Actions (Edit) */}
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                                        <button
                                                            onClick={() => setEditingShift({ user, date: day })}
                                                            className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Shift Modal */}
            {editingShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface-dark w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151b2b]">
                            <div>
                                <h2 className="text-lg font-bold text-white">Alterar Turno</h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {editingShift.user.name} • {editingShift.date.toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <button onClick={() => setEditingShift(null)} className="text-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {Object.values(SHIFT_TYPES).map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => handleOverrideShift(type.type as ShiftType)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] ${type.color} bg-[#1a2133] border-white/5 hover:border-white/20`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{type.icon}</span>
                                    <span className="font-bold text-xs uppercase tracking-wider">{type.label}</span>
                                    <span className="text-[10px] opacity-70">{type.time}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


