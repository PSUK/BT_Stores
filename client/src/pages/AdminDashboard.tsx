import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, LogOut, FileText, Pencil } from 'lucide-react';
import { deleteStore, fetchStores, type Store } from '../api/stores';
import StoreForm from '../components/Admin/StoreForm';
import BulkImport from '../components/Admin/BulkImport';

export default function AdminDashboard() {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        loadStores();
    }, [navigate]);

    const loadStores = async () => {
        setIsLoading(true);
        try {
            const data = await fetchStores();
            setStores(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this store?')) return;
        try {
            const token = localStorage.getItem('adminToken')!;
            await deleteStore(id, token);
            loadStores();
        } catch (e) {
            alert('Failed to delete store');
        }
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setShowForm(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-bt-magenta rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white font-bold">BT</span>
                            </div>
                            <span className="font-bold text-gray-900">Admin Panel</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/" className="text-sm text-gray-500 hover:text-bt-magenta">View Public App</a>
                            <button onClick={handleLogout} className="flex items-center text-sm text-red-600 hover:text-red-700">
                                <LogOut className="w-4 h-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Manage Stores</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowImport(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Bulk Import
                            </button>
                            <button
                                onClick={() => {
                                    setEditingStore(undefined);
                                    setShowForm(true);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bt-magenta hover:bg-opacity-90 focus:outline-none"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Store
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {stores.map(store => (
                                <li key={store.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-bt-magenta truncate">{store.name}</p>
                                            <p className="flex items-center text-sm text-gray-500">
                                                <span className="truncate">{store.address}, {store.postcode}</span>
                                            </p>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(store)}
                                                className="text-gray-400 hover:text-bt-magenta p-2"
                                                title="Edit"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(store.id)}
                                                className="text-gray-400 hover:text-red-600 p-2"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {stores.length === 0 && !isLoading && (
                                <li className="px-4 py-8 text-center text-gray-500">No stores found. Add one to get started.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </main>

            {showImport && (
                <BulkImport
                    onClose={() => setShowImport(false)}
                    onSuccess={() => {
                        loadStores();
                    }}
                />
            )}

            {showForm && (
                <StoreForm
                    initialData={editingStore}
                    onClose={() => {
                        setShowForm(false);
                        setEditingStore(undefined);
                    }}
                    onSuccess={() => {
                        loadStores();
                        setShowForm(false);
                        setEditingStore(undefined);
                    }}
                />
            )}
        </div>
    );
}
