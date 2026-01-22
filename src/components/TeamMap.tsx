
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User } from '../types';

// Fix for default marker icon in Leaflet + Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TeamMapProps {
    users: User[];
}

// Function to generate deterministic coordinates from a string (address)
// This is for demonstration purposes since we don't have a real-time geocoder
const getCoordsFromAddress = (address: string): [number, number] => {
    // Base center: São Paulo area
    const baseLat = -23.5505;
    const baseLng = -46.6333;

    // Create a simple hash from address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = ((hash << 5) - hash) + address.charCodeAt(i);
        hash |= 0;
    }

    // Use hash to generate small offset
    const latOffset = (hash % 100) / 1000;
    const lngOffset = ((hash >> 4) % 100) / 1000;

    return [baseLat + latOffset, baseLng + lngOffset];
};

export const TeamMap: React.FC<TeamMapProps> = ({ users }) => {
    return (
        <div className="h-[500px] w-full rounded-3xl border border-white/5 overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <MapContainer
                center={[-23.5505, -46.6333]}
                zoom={11}
                style={{ height: '100%', width: '100%', background: '#1a0f10' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {users.filter(u => u.address).map((user) => {
                    const position = getCoordsFromAddress(user.address || '');
                    return (
                        <Marker key={user.id} position={position}>
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="h-full w-full object-cover" alt={user.name} />
                                            ) : (
                                                <span className="text-primary font-black text-xs">{user.initials}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{user.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                        {user.address}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
