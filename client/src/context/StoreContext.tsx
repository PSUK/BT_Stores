import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { fetchStores, type Store } from '../api/stores';

interface StoreContextType {
    stores: Store[];
    selectedStore: Store | null;
    userLocation: [number, number] | null;
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterType: 'ALL' | 'DELIVERY_STA' | 'FSL_STA';
    setFilterType: (type: 'ALL' | 'DELIVERY_STA' | 'FSL_STA') => void;
    refreshStores: () => void;
    editingStoreId: string | null;
    setEditingStoreId: (id: string | null) => void;
    selectStore: (store: Store | null) => void;
    handleLocateMe: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'DELIVERY_STA' | 'FSL_STA'>('ALL');
    const [isLoading, setIsLoading] = useState(true);

    const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

    const loadStores = async () => {
        setIsLoading(true);
        try {
            const data = await fetchStores();
            setStores(data);
        } catch (error) {
            console.error('Failed to load stores', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectStore = (store: Store | null) => {
        setSelectedStore(store);
        setEditingStoreId(null); // Clear editing state when selecting a new store
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Got location:', position.coords.latitude, position.coords.longitude);
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setSelectedStore(null); // Clear selection to ensure map centers on user
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                // Do not fallback automatically to avoid confusing the user.
                // Or inform the user via UI state (add error state later if needed)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    // Initial load
    useEffect(() => {
        loadStores();
        handleLocateMe();
    }, []);

    // Clear selected store (and route) when user starts searching
    useEffect(() => {
        if (searchQuery) {
            setSelectedStore(null);
        }
    }, [searchQuery]);

    // Clear selected store if filter changes and excludes it
    useEffect(() => {
        if (selectedStore && filterType !== 'ALL' && selectedStore.type !== filterType) {
            setSelectedStore(null);
        }
    }, [filterType, selectedStore]);

    // Derived state: filtered and sorted stores
    const sortedStores = useMemo(() => {
        let filtered = stores;

        // 1. Filter by Type
        if (filterType !== 'ALL') {
            filtered = filtered.filter(store => store.type === filterType);
        }

        // 2. Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(query) ||
                store.address.toLowerCase().includes(query) ||
                store.postcode.toLowerCase().includes(query)
            );
        }

        if (!userLocation && filtered.length === 0) return filtered;

        return [...filtered].map(store => {
            const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], store.lat, store.lng) : undefined;
            return { ...store, distance: dist };
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }, [stores, userLocation, searchQuery, filterType]);

    return (
        <StoreContext.Provider value={{
            stores: sortedStores,
            selectedStore,
            userLocation,
            isLoading,
            searchQuery,
            setSearchQuery,
            filterType,
            setFilterType,
            selectStore: handleSelectStore,
            handleLocateMe,
            refreshStores: loadStores,
            editingStoreId,
            setEditingStoreId
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStores = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStores must be used within a StoreProvider');
    return context;
};

// Simple Haversine formula for distance in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
