import { useState } from 'react';
import { createStore, updateStore, type Store } from '../../api/stores';
import { X } from 'lucide-react';

interface StoreFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Store;
}

export default function StoreForm({ onClose, onSuccess, initialData }: StoreFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        address: initialData?.address || '',
        postcode: initialData?.postcode || '',
        lat: initialData?.lat.toString() || '',
        lng: initialData?.lng.toString() || '',
        notes: initialData?.notes || '',
        type: (initialData?.type || 'DELIVERY_STA') as 'DELIVERY_STA' | 'FSL_STA',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) throw new Error('Not authenticated');

            const storeData = {
                ...formData,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                type: formData.type,
            };

            if (initialData) {
                await updateStore(initialData.id, storeData, token);
            } else {
                await createStore(storeData, token);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to save store. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeocode = async () => {
        if (!formData.postcode) {
            alert('Please enter a postcode to auto-generate location.');
            return;
        }
        setLoading(true);
        try {
            // Try Postcodes.io first (Best for UK postcodes - always centers on the postcode)
            const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formData.postcode)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 200 && data.result) {
                    setFormData(prev => ({
                        ...prev,
                        lat: data.result.latitude,
                        lng: data.result.longitude
                    }));
                    setLoading(false);
                    return;
                }
            }

            // Fallback to Nominatim if Postcodes.io gives no result
            const query = `${formData.address}, ${formData.postcode}`;
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const nomData = await nomRes.json();

            if (nomData && nomData[0]) {
                setFormData(prev => ({
                    ...prev,
                    lat: nomData[0].lat,
                    lng: nomData[0].lon
                }));
            } else {
                alert('Could not geocode address. Please check the postcode or enter coordinates manually.');
            }
        } catch (e) {
            console.error(e);
            alert('Geocoding failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{initialData ? 'Edit Store' : 'Add New Store'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Store Name</label>
                        <input
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Type</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="DELIVERY_STA"
                                    checked={formData.type === 'DELIVERY_STA'}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as 'DELIVERY_STA' | 'FSL_STA' })}
                                    className="text-bt-magenta focus:ring-bt-magenta"
                                />
                                <span className="text-sm text-gray-700">Delivery Station (DELIVERY_STA)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="FSL_STA"
                                    checked={formData.type === 'FSL_STA'}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as 'DELIVERY_STA' | 'FSL_STA' })}
                                    className="text-bt-magenta focus:ring-bt-magenta"
                                />
                                <span className="text-sm text-gray-700">Forward Stock Location (FSL_STA)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Postcode</label>
                            <input
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                                value={formData.postcode}
                                onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex items-end">
                            <button
                                type="button"
                                onClick={handleGeocode}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Auto Geocode
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Latitude</label>
                            <input
                                required
                                type="number"
                                step="any"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                                value={formData.lat}
                                onChange={e => setFormData({ ...formData, lat: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Longitude</label>
                            <input
                                required
                                type="number"
                                step="any"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                                value={formData.lng}
                                onChange={e => setFormData({ ...formData, lng: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-bt-magenta focus:ring-bt-magenta outline-none"
                            rows={3}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-bt-magenta hover:bg-opacity-90 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Store' : 'Save Store')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
