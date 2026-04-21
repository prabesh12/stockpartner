import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    center?: [number, number];
    zoom?: number;
    mode?: 'picker' | 'display' | 'routing';
    onLocationSelect?: (lat: number, lng: number) => void;
    location?: [number, number] | null;
    userLocation?: [number, number] | null;
}

const isValidCoord = (coord: any): coord is [number, number] => {
    return Array.isArray(coord) && 
           coord.length === 2 && 
           typeof coord[0] === 'number' && !isNaN(coord[0]) &&
           typeof coord[1] === 'number' && !isNaN(coord[1]);
};

// Sub-component to handle map clicks for picking location
const MapPicker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Sub-component to update map view when center prop changes
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (isValidCoord(center)) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

// Sub-component for Routing
const RoutingControl = ({ from, to }: { from: [number, number], to: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !isValidCoord(from) || !isValidCoord(to)) return;

        const routingControl = (L as any).Routing.control({
            waypoints: [
                L.latLng(from[0], from[1]),
                L.latLng(to[0], to[1])
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#10b981', weight: 4 }] // Emerald color
            }
        }).addTo(map);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, from, to]);

    return null;
};

export const MapComponent = ({ 
    center = [27.7172, 85.3240], // Default Kathmandu
    zoom = 13, 
    mode = 'display',
    onLocationSelect,
    location,
    userLocation
}: MapComponentProps) => {
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(
        isValidCoord(location) ? location : null
    );

    useEffect(() => {
        if (isValidCoord(location)) setMarkerPos(location);
    }, [location]);

    const handleMapClick = (lat: number, lng: number) => {
        if (mode === 'picker') {
            setMarkerPos([lat, lng]);
            onLocationSelect?.(lat, lng);
        }
    };

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapContainer 
                center={isValidCoord(location) ? location : center} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {markerPos && mode !== 'routing' && <Marker position={markerPos} />}
                
                {mode === 'picker' && <MapPicker onSelect={handleMapClick} />}
                
                {mode === 'routing' && userLocation && location && (
                    <RoutingControl from={userLocation} to={location} />
                )}

                {/* Auto-update center when coordinates are found (e.g. GPS) */}
                {isValidCoord(location) && mode !== 'routing' && <MapUpdater center={location} />}
            </MapContainer>
        </div>
    );
};
