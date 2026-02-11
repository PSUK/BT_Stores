import { useStores } from '../../context/StoreContext';
import StoreCard from './StoreCard';

export default function StoreList() {
    const { stores, isLoading } = useStores();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bt-magenta"></div>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No stores found matching your criteria.
            </div>
        );
    }

    return (
        <div className="w-full">
            {stores.map(store => (
                <StoreCard key={store.id} store={store} />
            ))}
        </div>
    );
}
