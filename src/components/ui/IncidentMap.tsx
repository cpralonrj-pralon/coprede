import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for map rendering issues in flex containers
const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};
import { OperationalIncident } from '../../types';

// Fix Leaflet Icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface IncidentMapProps {
    incidents: OperationalIncident[];
    height?: string;
}

// Simple deterministic hash for coordinates since we don't have lat/long in DB yet
const getFakeCoords = (city: string): [number, number] => {
    if (!city) return [-23.5505, -46.6333]; // Fallback to SP

    // Hash string to get consistent random offset
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
        hash = city.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Base centers for known large regions (could be expanded)
    const bases: Record<string, [number, number]> = {
        'SAO PAULO': [-23.5505, -46.6333],
        'RIO DE JANEIRO': [-22.9068, -43.1729],
        'BELO HORIZONTE': [-19.9167, -43.9345],
        'CAMPINAS': [-22.9099, -47.0626],
        'PORTO ALEGRE': [-30.0346, -51.2177],
        'CURITIBA': [-25.4284, -49.2733],
        'BRASILIA': [-15.7975, -47.8919],
        'RECIFE': [-8.0476, -34.8770],
        'SALVADOR': [-12.9777, -38.5016],
        'FORTALEZA': [-3.7172, -38.5434],
        'MANAUS': [-3.1190, -60.0217],

        // Interior SP
        'JUNDIAI': [-23.1856, -46.8978],
        'SAO CARLOS': [-22.0087, -47.8908],
        'SAO JOSE DOS CAMPOS': [-23.1896, -45.8841],
        'RIBEIRAO PRETO': [-21.1704, -47.8103],
        'SOROCABA': [-23.5015, -47.4521],

        // Rio & Grande Rio
        'NITEROI': [-22.8859, -43.1152],
        'SAO GONCALO': [-22.8269, -43.0539],
        'DUQUE DE CAXIAS': [-22.7915, -43.3057],
        'NOVA IGUACU': [-22.7599, -43.4503],
        'BELFORD ROXO': [-22.7589, -43.3930],
        'SAO JOAO DE MERITI': [-22.8049, -43.3724],
        'MESQUITA': [-22.7838, -43.4323],
        'BARRA MANSA': [-22.5441, -44.1727],
        'VOLTA REDONDA': [-22.5202, -44.1041],
        'PETROPOLIS': [-22.5113, -43.1775],

        // Minas Gerais
        'IPATINGA': [-19.4687, -42.5372],
        'JUIZ DE FORA': [-21.7595, -43.3398],
        'UBERLANDIA': [-18.9186, -48.2772],
        'CONTAGEM': [-19.9320, -44.0539],
        'VARGINHA': [-21.5517, -45.4300],

        // Nordeste
        'TERESINA': [-5.0892, -42.8016],
        'JOAO PESSOA': [-7.1153, -34.8610],
        'MACEIO': [-9.6663, -35.7351],
        'ARACAJU': [-10.9472, -37.0731],
        'NATAL': [-5.7945, -35.2110],
        'SAO LUIS': [-2.5307, -44.3068],
        'LAURO DE FREITAS': [-12.8943, -38.3272],

        // Centro-Oeste
        'GOIANIA': [-16.6869, -49.2648],
        'CUIABA': [-15.6010, -56.0979],
        'CAMPO GRANDE': [-20.4697, -54.6201],
        'DOURADOS': [-22.2236, -54.8125],
        'JATAI': [-17.8814, -51.7144],

        // North
        'BELEM': [-1.4558, -48.4902],

        // Espirito Santo
        'VILA VELHA': [-20.3297, -40.2925]
    };

    const upperCity = city.toUpperCase();
    const baseKey = Object.keys(bases).find(k => upperCity.includes(k));
    const base = baseKey ? bases[baseKey] : bases['SAO PAULO'];

    if (base === bases['SAO PAULO'] && !upperCity.includes('PAULO')) {
        // Unknown city? Don't throw it in the ocean!
        // Just jitter slightly around SP until we add coords
        const latOffset = (hash % 100) / 500; // Max 0.2 deg
        const lngOffset = ((hash >> 4) % 100) / 500;
        return [base[0] + latOffset, base[1] + lngOffset];
    }

    // Small jitter for incidents in same city (avoid exact overlap)
    const latOffset = (hash % 100) / 3000;
    const lngOffset = ((hash >> 5) % 100) / 3000;

    return [base[0] + latOffset, base[1] + lngOffset];
};

const getColor = (severity: string) => {
    if (severity?.toLowerCase().includes('critical') || severity?.toLowerCase().includes('alta') || severity?.toLowerCase().includes('rompimento')) return '#ef4444'; // Red-500
    if (severity?.toLowerCase().includes('warning') || severity?.toLowerCase().includes('media')) return '#f59e0b'; // Amber-500
    return '#3b82f6'; // Blue-500
};

const isOver24h = (dateStr: string) => {
    if (!dateStr) return false;
    try {
        const start = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const hours = (now - start) / (1000 * 60 * 60);
        return hours > 24;
    } catch { return false; }
};

export const IncidentMap: React.FC<IncidentMapProps> = ({ incidents, height = '400px' }) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    // Center map on SP by default
    const position: [number, number] = [-15.7975, -47.8919]; // Center of Brazil approximately

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const containerStyle = isFullscreen ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#1a0f10' // Match theme
    } : { height };

    return (
        <div
            className={`w-full rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative z-0 transition-all duration-300 ${isFullscreen ? '' : ''}`}
            style={containerStyle}
        >
            {/* Fullscreen Toggle Button */}
            <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-[500] bg-surface-dark/90 backdrop-blur border border-white/10 p-2 rounded-lg text-white hover:bg-white/10 transition-colors shadow-lg group"
                title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            >
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                    {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
                </span>
            </button>

            <MapContainer
                center={position}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#1a0f10' }}
                scrollWheelZoom={true}
            >
                <MapUpdater />
                {/* Dark Matter similar layer */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {incidents.map((incident) => {
                    const pos = getFakeCoords(incident.nm_cidade);
                    const over24 = isOver24h(incident.dh_inicio);

                    // Logic for color
                    let color = getColor(incident.nm_status || incident.ds_sumario);
                    if (over24) color = '#ef4444'; // Force Red for >24h

                    return (
                        <CircleMarker
                            key={incident.id}
                            center={pos}
                            radius={over24 ? 10 : 6} // Larger for critical
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: over24 ? 0.9 : 0.7,
                                weight: over24 ? 3 : 1,
                                className: over24 ? 'animate-pulse' : ''
                            }}
                        >
                            <Popup className="custom-popup" closeButton={true}>
                                <div className="p-3 min-w-[280px] font-sans bg-[#FFFDD0] rounded-xl shadow-xl">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-black text-gray-800 text-base uppercase tracking-tight">
                                            {incident.nm_tipo || 'EMERGENCIAL'}
                                        </h4>
                                        {over24 && (
                                            <span className="bg-[#f28b82] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
                                                {'>'}24h
                                            </span>
                                        )}
                                    </div>

                                    {/* Location Row */}
                                    <div className="mb-3">
                                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                                            {incident.nm_cidade} - {incident.regional}
                                        </p>
                                    </div>

                                    {/* Status & Time Row */}
                                    <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${color === '#ef4444' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {incident.nm_status}
                                        </span>
                                        <span className="text-gray-500 font-mono text-xs">
                                            {new Date(incident.dh_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:00
                                        </span>
                                    </div>

                                    {/* Footer / Summary */}
                                    <div className="text-[10px] text-gray-500 font-medium uppercase leading-relaxed">
                                        {incident.ds_sumario ? (
                                            incident.ds_sumario.replace(/ \/ /g, ' | ')
                                        ) : (
                                            'DETALHES NÃO DISPONÍVEIS'
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
