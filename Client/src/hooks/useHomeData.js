import { useState, useEffect } from 'react';
import { homeAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

// In each hook, replace the error setting with:
export const useTopCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await homeAPI.getTopCategories();
                setCategories(response.data.categories || []);
            } catch (err) {
                setError(handleApiError(err));
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};

export const useTopPlants = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                setLoading(true);
                const response = await homeAPI.getTopPlants();
                setPlants(response.data || []);
            } catch (err) {
                setError(handleApiError(err));
            }
            finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, []);

    return { plants, loading, error };
};

export const useTopSellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                setLoading(true);
                const response = await homeAPI.getTopSellers();
                setSellers(response.data || []);
            } catch (err) {
                setError(handleApiError(err));
            }
            finally {
                setLoading(false);
            }
        };

        fetchSellers();
    }, []);

    return { sellers, loading, error };
};