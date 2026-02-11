import { Search } from 'lucide-react';
import Map from '../components/Map/Map';
import StoreList from '../components/StoreList/StoreList';
import { useStores } from '../context/StoreContext';

export default function PublicLayout() {
    const { searchQuery, setSearchQuery } = useStores();
    // No viewMode state needed anymore as we show both

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50 flex-col md:flex-row">
            {/* Mobile Header - Glassmorphism */}
            <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 shrink-0 z-30 shadow-sm transition-all">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-bt-magenta to-pink-600 rounded-xl shadow-lg shadow-bt-magenta/20 flex items-center justify-center transform active:scale-95 transition-transform">
                        <span className="text-white font-bold text-xl">BT</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Store Locator</h1>
                </div>
                {/* Search Bar - Mobile */}
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by city or postcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bt-magenta/20 focus:border-bt-magenta transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="sr-only">Clear</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* MAP AREA */}
            {/* on Mobile: Top half (flex-1 or h-1/2), on Desktop: Right side (flex-1) */}
            {/* We create a flex container order hack or just standard DOM order?
                Standard DOM order: Header -> List -> Map (Desktop)
                On Mobile requested: Header -> Map -> List
                So we need to swap order or use flex-col-reverse? 
                Actually easier to just have Map first in DOM for mobile? 
                Desktop: List (Left), Map (Right). 
                Mobile: Map (Top), List (Bottom).
                
                Let's use Order utilities:
                Desktop: List (order-1), Map (order-2)
                Mobile: Map (order-1), List (order-2)
            */}

            {/* Left Sidebar (List) */}
            {/* Mobile: Order 2 (Bottom), h-1/2. Desktop: Order 1 (Left), w-[450px], h-full */}
            <div className="order-2 md:order-1 w-full md:w-[400px] lg:w-[450px] flex flex-col h-[50%] md:h-full bg-white shadow-xl z-20 shrink-0 relative">
                {/* Desktop Header - Glassmorphism */}
                <div className="hidden md:block p-6 sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 z-30">
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-bt-magenta to-pink-600 rounded-xl shadow-lg shadow-bt-magenta/20 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">BT</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Store Locator</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-10">Find materials & equipment nearby</p>

                    {/* Desktop Search */}
                    <div className="px-6 pb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by city or postcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bt-magenta/20 focus:border-bt-magenta transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="sr-only">Clear</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <StoreList />
                </div>

                {/* Footer / Admin Link */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center shrink-0 flex flex-col gap-2">
                    <span className="text-xs font-medium text-gray-400">Created by KG273 &copy;</span>
                    <a href="/admin/login" className="text-[10px] text-gray-300 hover:text-bt-magenta transition-colors">
                        Admin Access
                    </a>
                </div>
            </div>

            {/* Right Map Area */}
            {/* Mobile: Order 1 (Top), h-1/2. Desktop: Order 2 (Right), flex-1, h-full */}
            <div className="order-1 md:order-2 flex-1 h-[50%] md:h-full relative z-10 w-full">
                <Map />
            </div>

        </div>
    );
}
