import { useState, useEffect } from 'react';
import { plantDetailAPI } from '../services/api';

export const usePlantDetail = (plantId) => {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlantDetail = async () => {
      try {
        setLoading(true);
        const response = await plantDetailAPI.getPlantDetails(plantId);
        setPlant(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch plant details');
      } finally {
        setLoading(false);
      }
    };

    if (plantId) {
      fetchPlantDetail();
    }
  }, [plantId]);

  return { plant, loading, error };
};

export const usePlantReviews = (plantId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await plantDetailAPI.getReviews(plantId);
        setReviews(response.data.reviews || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    if (plantId) {
      fetchReviews();
    }
  }, [plantId]);

  return { reviews, loading, error, setReviews };
};