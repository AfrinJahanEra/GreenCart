import { useState, useEffect } from 'react';
import { plantCollectionAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const usePlantsByCategory = (categorySlug) => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                setLoading(true);
                let response;

                if (categorySlug) {
                    response = await plantCollectionAPI.getPlantsByCategory(categorySlug);
                } else {
                    // If no category, get all plants (you might need to create this endpoint)
                    response = await plantCollectionAPI.searchPlants('');
                }

                setPlants(response.data.plants || []);
            } catch (err) {
                setError(handleApiError(err));
            }
            finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, [categorySlug]);

    return { plants, loading, error };
};

export const useAllCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await plantCollectionAPI.getAllCategories();
                setCategories(response.data.categories || []);
            } catch (err) {
                setError(handleApiError(err));
            }
            finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};