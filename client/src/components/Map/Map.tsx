import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate, Navigation } from 'lucide-react';
import { useStores } from '../../context/StoreContext';
import { type Store } from '../../api/stores';


import RoutingMachine from './RoutingMachine';

interface StoreMarkerProps {
    store: Store;
    selectedStore: Store | null;
    selectStore: (store: Store) => void;
    userLocation: [number, number] | null;
    getIcon: (type: string | undefined) => L.DivIcon;
}

const StoreMarker = ({ store, selectedStore, selectStore, userLocation, getIcon }: StoreMarkerProps) => {
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        if (selectedStore?.id === store.id && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [selectedStore, store.id]);

    return (
        <Marker
            ref={markerRef}
            position={[store.lat, store.lng]}
            icon={getIcon(store.type)}
            eventHandlers={{
                click: () => selectStore(store),
            }}
        >
            <Popup>
                <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold text-bt-magenta">{store.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                    <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${store.type?.toUpperCase() === 'DELIVERY_STA' ? 'bg-teal-600' : 'bg-bt-magenta'}`}>
                            {store.type?.toUpperCase() === 'DELIVERY_STA' ? 'ECP (Delivery)' : 'FSL Station'}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (userLocation) {
                                    window.open(`https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${store.lat},${store.lng}`, '_blank');
                                } else {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`, '_blank');
                                }
                            }}
                            className="flex items-center px-3 py-1 bg-bt-magenta text-white text-xs font-bold rounded-full shadow hover:bg-pink-700 transition-colors ml-2"
                        >
                            <Navigation className="w-3 h-3 mr-1" />
                            GO
                        </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

// Smart Map Controller
function MapViewControl({
    center,
    userLocation,
    nearestStore
}: {
    center: [number, number],
    userLocation: [number, number] | null,
    nearestStore: { lat: number, lng: number } | null
}) {
    const map = useMap();

    // Force invalidation of size
    useEffect(() => {
        map.invalidateSize();
    }, [map]);

    useEffect(() => {
        if (!center) return;

        // If we have a user location but NO selected store (i.e., just "Locate Me")
        // and we have a nearest store, fit bounds to show both.
        if (userLocation && nearestStore && center[0] === userLocation[0] && center[1] === userLocation[1]) {
            const bounds = L.latLngBounds([userLocation, [nearestStore.lat, nearestStore.lng]]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.5 });
        } else {
            // Standard flyTo behavior
            map.flyTo(center, 12, { duration: 1.5 });
        }
    }, [center, map, userLocation, nearestStore]);
    return null;
}

export default function Map() {
    const { stores, selectedStore, selectStore, userLocation, handleLocateMe, filterType, setFilterType } = useStores();

    const defaultCenter: [number, number] = [54.5, -4.0]; // UK Center
    const center = selectedStore
        ? [selectedStore.lat, selectedStore.lng] as [number, number]
        : userLocation || defaultCenter;

    const getIcon = (type: string | undefined) => {
        const normalizedType = type ? type.toUpperCase() : 'DELIVERY_STA';
        const color = normalizedType === 'DELIVERY_STA' ? '#00A3A1' : '#E6007E'; // Teal for Delivery, Magenta for FSL
        return new L.DivIcon({
            className: 'bg-transparent',
            html: `<div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24], // Bottom center
            popupAnchor: [0, -24]
        });
    };

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={6} // Start zoomed out to see whole UK
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Routing Machine: Show route if user location AND selected store are available */}
                {userLocation && selectedStore && (
                    <RoutingMachine
                        userLocation={userLocation}
                        destination={[selectedStore.lat, selectedStore.lng]}
                    />
                )}

                {/* Update view when selection/location changes */}
                <MapViewControl
                    center={center}
                    userLocation={userLocation}
                    nearestStore={stores.length > 0 ? stores[0] : null}
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={new L.DivIcon({
                            className: 'bg-bt-blue border-2 border-white rounded-full w-4 h-4 shadow-lg animate-pulse',
                            iconSize: [16, 16]
                        })}
                    >
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {stores.map(store => (
                    <StoreMarker
                        key={store.id}
                        store={store}
                        selectedStore={selectedStore}
                        selectStore={selectStore}
                        userLocation={userLocation}
                        getIcon={getIcon}
                    />
                ))}
            </MapContainer>

            {/* Custom Controls */}
            <div className="absolute top-4 right-4 z-400 flex flex-col gap-2">
                <button
                    onClick={handleLocateMe}
                    className="bg-white p-2.5 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Find my location"
                >
                    <Locate className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[400] bg-white rounded-full shadow-lg p-1 flex space-x-1 border border-gray-100">
                <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === 'ALL'
                        ? 'bg-bt-blue text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilterType('FSL_STA')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${filterType === 'FSL_STA'
                        ? 'bg-bt-magenta text-white shadow-md'
                        : 'text-gray-600 hover:bg-pink-50'
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-bt-magenta border border-white"></span>
                    FSL
                </button>
                <button
                    onClick={() => setFilterType('DELIVERY_STA')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${filterType === 'DELIVERY_STA'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-teal-50'
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-teal-600 border border-white"></span>
                    ECP (Delivery)
                </button>
            </div>
        </div>
    );
}
