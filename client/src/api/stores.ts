import axios from 'axios';

const API_URL = ''; // Relative path for production/proxy

export interface Store {
    id: string;
    name: string;
    address: string;
    postcode: string;
    lat: number;
    lng: number;
    notes?: string;
    type: 'DELIVERY_STA' | 'FSL_STA';
    distance?: number; // Calculated on frontend
}

export const fetchStores = async (): Promise<Store[]> => {
    const response = await axios.get(`${API_URL}/stores`);
    return response.data;
};

export const createStore = async (store: Omit<Store, 'id' | 'distance'>, token: string) => {
    const response = await axios.post(`${API_URL}/stores`, store, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateStore = async (id: string, store: Omit<Store, 'id' | 'distance'>, token: string) => {
    const response = await axios.put(`${API_URL}/stores/${id}`, store, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const deleteStore = async (id: string, token: string) => {
    await axios.delete(`${API_URL}/stores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateStoreNote = async (id: string, note: string) => {
    const response = await axios.patch(`${API_URL}/stores/${id}/note`, { note });
    return response.data;
};
