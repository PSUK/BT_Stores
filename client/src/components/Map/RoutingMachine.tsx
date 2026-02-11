import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingProps {
    userLocation: [number, number] | null;
    destination: [number, number] | null;
}

export default function RoutingMachine({ userLocation, destination }: RoutingProps) {
    const map = useMap();

    useEffect(() => {
        if (!userLocation || !destination) return;

        // @ts-ignore - Leaflet Routing Machine types might be missing 'Routing' on L
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            ],
            // Use OSRM demo server (default)
            // In production you should use your own OSRM server or a paid provider like Mapbox
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            lineOptions: {
                styles: [{ color: '#0099FF', weight: 6, opacity: 0.8 }]
            } as any,
            show: false, // Hide the turn-by-turn text container
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            createMarker: () => null // Don't create default markers, we have our own
        } as any).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, userLocation, destination]);

    return null;
}
