import { useState } from 'react';
import { X } from 'lucide-react';
import { createStore } from '../../api/stores';

interface BulkImportProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkImport({ onClose, onSuccess }: BulkImportProps) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleImport = async () => {
        setLoading(true);
        setStatus('Parsing...');
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) throw new Error('Not authenticated');

            // Simple CSV/Line parser
            // Format: Name, Address, Postcode, Lat, Lng
            const lines = text.split('\n').filter(l => l.trim());
            let successCount = 0;
            let failCount = 0;

            for (const line of lines) {
                try {
                    // Try JSON first
                    if (line.trim().startsWith('{')) {
                        const data = JSON.parse(line);
                        await createStore(data, token);
                        successCount++;
                        continue;
                    }

                    // Try CSV
                    const parts = line.split(',').map(p => p.trim());
                    if (parts.length >= 5) {
                        const [name, address, postcode, latStr, lngStr] = parts;
                        await createStore({
                            name,
                            address,
                            postcode,
                            lat: parseFloat(latStr),
                            lng: parseFloat(lngStr),
                            notes: parts[5] || '',
                            type: (parts[6] || 'DELIVERY_STA') as 'DELIVERY_STA' | 'FSL_STA'
                        }, token);
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (e) {
                    failCount++;
                }
            }

            setStatus(`Imported ${successCount} stores. Failed: ${failCount}`);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (e) {
            setStatus('Import failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Bulk Import</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Paste CSV lines (Name, Address, Postcode, Lat, Lng, Notes) or JSON objects (one per line).
                </p>

                <textarea
                    className="w-full h-48 rounded-md border border-gray-300 p-2 text-sm font-mono focus:border-bt-purple focus:ring-bt-purple outline-none"
                    placeholder="BT Store A, 123 Main St, W1 1AA, 51.5, -0.1, Open late"
                    value={text}
                    onChange={e => setText(e.target.value)}
                />

                {status && <div className="mt-2 text-sm font-medium text-bt-purple">{status}</div>}

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={loading || !text.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-bt-purple hover:bg-opacity-90 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Importing...' : 'Import Stores'}
                    </button>
                </div>
            </div>
        </div>
    );
}
