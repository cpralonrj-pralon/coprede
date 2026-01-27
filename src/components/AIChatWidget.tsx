import React, { useState, useRef, useEffect } from 'react';

interface AIChatWidgetProps {
    onFilterChange: (filters: any) => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Oi! Pode me pedir coisas como "Moatrar problemas em Campinas" ou "Filtrar GPON".' }
    ]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        // 1. Add User Message
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        const command = input.toLowerCase();
        setInput('');

        // 2. Intent Parser (Local Logic)
        let responseText = "Entendi. Atualizando o painel...";
        const newFilters: any = {};

        // --- Logic: Cities ---
        if (command.includes('campinas')) newFilters.cidade = 'CAMPINAS';
        else if (command.includes('sumare') || command.includes('sumaré')) newFilters.cidade = 'SUMARE';
        else if (command.includes('americana')) newFilters.cidade = 'AMERICANA';

        // --- Logic: Tech ---
        if (command.includes('gpon') || command.includes('fibra')) newFilters.tecnologia = 'GPON';
        else if (command.includes('hfc') || command.includes('coax')) newFilters.tecnologia = 'HFC';

        // --- Logic: Time ---
        if (command.includes('ontem')) newFilters.time = 'Ontem';
        else if (command.includes('hoje')) newFilters.time = 'Hoje';

        // --- Logic: Status ---
        if (command.includes('critico') || command.includes('crítico')) newFilters.status = 'CRITICO';

        // Apply filters
        onFilterChange(newFilters);

        // 3. Add AI Response
        setTimeout(() => {
            if (Object.keys(newFilters).length === 0) {
                responseText = "Desculpe, não entendi o filtro. Tente citar uma cidade ou tecnologia.";
            }
            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        }, 500);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
            >
                <span className="material-symbols-outlined text-2xl">chat_spark</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">psychology</span>
                            Analista Virtual
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-black/20">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-200'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/5 bg-black/40 flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte algo..."
                            className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-transparent"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
