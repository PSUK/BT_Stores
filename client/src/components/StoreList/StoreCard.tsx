import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, ChevronRight, Truck, Package, Save, X, NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { type Store, updateStoreNote } from '../../api/stores';
import { useStores } from '../../context/StoreContext';

interface StoreCardProps {
    store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
    const { selectedStore, selectStore, userLocation, refreshStores, editingStoreId, setEditingStoreId } = useStores();
    const isSelected = selectedStore?.id === store.id;
    const isEditing = editingStoreId === store.id;
    const [noteInput, setNoteInput] = useState(store.notes || '');

    const handleSaveNote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!noteInput.trim()) return;

        try {
            await updateStoreNote(store.id, noteInput);
            setEditingStoreId(null);
            refreshStores(); // Refresh to show new note
        } catch (error) {
            console.error('Failed to save note', error);
            alert('Failed to save note. Please try again.');
        }
    };

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (userLocation) {
            window.open(`https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${store.lat},${store.lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`, '_blank');
        }
    };

    const getTypeDetails = (type: string | undefined) => {
        if (type === 'DELIVERY_STA') {
            return { icon: Truck, label: 'ECP (Delivery)', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' };
        }
        if (type === 'FSL_STA') {
            return { icon: Package, label: 'FSL Station (Pickup)', color: 'text-bt-magenta', bg: 'bg-pink-50', border: 'border-pink-100' };
        }
        return { icon: Clock, label: type, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' };
    };

    const typeDetails = getTypeDetails(store.type);
    const TypeIcon = typeDetails.icon;

    return (
        <motion.div
            onClick={() => selectStore(store)}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            className={`
                group relative p-5 mb-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                ${isSelected
                    ? 'bg-white border-bt-magenta shadow-xl ring-1 ring-bt-magenta'
                    : 'bg-white border-gray-100 hover:border-bt-blue/30 hover:shadow-lg'
                }
            `}
        >
            {/* Decorative gradient blob for selected state */}
            {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-bt-magenta/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            )}

            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3 flex-1 mr-4">
                    {/* Header */}
                    <div>
                        <h3 className={`font-bold text-lg transition-colors ${isSelected ? 'text-bt-magenta' : 'text-gray-900 group-hover:text-bt-blue'}`}>
                            {store.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium flex items-center mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {store.address}, <span className="text-gray-700 ml-1 font-semibold">{store.postcode}</span>
                        </p>
                    </div>

                    {/* Metadata / Notes */}
                    {/* Metadata / Notes */}
                    <div className="mt-2">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="eg. break time 12.00-13.00"
                                    className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-bt-magenta"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveNote}
                                    className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                    title="Save Note"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStoreId(null);
                                    }}
                                    className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                    title="Cancel"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group/note">
                                <div className={`flex items-center text-xs p-2 rounded-lg border ${typeDetails.bg} ${typeDetails.border} ${typeDetails.color}`}>
                                    <TypeIcon className="w-3.5 h-3.5 mr-2 shrink-0" />
                                    <span className="font-medium">{typeDetails.label}</span>
                                </div>

                                {store.notes ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center text-xs text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100 shadow-sm">
                                            <NotebookPen className="w-3.5 h-3.5 mr-2 text-yellow-600 mt-0.5 shrink-0" />
                                            <span className="leading-relaxed font-medium">{store.notes}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingStoreId(store.id);
                                                    setNoteInput(store.notes || '');
                                                }}
                                                className="p-1.5 bg-white text-gray-500 hover:text-bt-blue hover:bg-blue-50 rounded border border-gray-200 shadow-sm"
                                                title="Edit Note"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Trigger delete (empty string)
                                                    updateStoreNote(store.id, '').then(() => refreshStores());
                                                }}
                                                className="p-1.5 bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 rounded border border-gray-200 shadow-sm"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingStoreId(store.id);
                                            setNoteInput('');
                                        }}
                                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-bt-magenta hover:bg-pink-50 rounded-lg transition-colors border border-transparent hover:border-pink-100"
                                        title="Add Note"
                                    >
                                        <NotebookPen className="w-3.5 h-3.5" />
                                        <span>Add Note</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chips */}
                    {store.distance !== undefined && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-bt-blue border border-blue-100">
                            <Navigation className="w-3 h-3 mr-1.5" />
                            {store.distance?.toFixed(1)} miles away
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-end space-y-2">
                    {isSelected ? (
                        <button
                            onClick={handleNavigate}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-bt-magenta to-pink-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:to-pink-500 transition-all transform active:scale-95"
                        >
                            <Navigation className="w-3 h-3 mr-1.5" />
                            Go
                        </button>
                    ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-bt-magenta text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-bt-blue/10 group-hover:text-bt-blue'}`}>
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-2">
                            {/* Content intentionally empty for future expansion */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
