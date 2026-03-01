import axios from 'axios';
import { Lawyer, SearchParams, Review } from '../types';

// Fallback for Vite env variable to fix TypeScript error
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://lexmetric-app.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Bypass-Tunnel-Reminder': 'true'
    }
});

export const searchLawyers = async (params: SearchParams): Promise<Lawyer[]> => {
    try {
        const response = await api.get('/api/lawyers/search', { params });
        return response.data;
    } catch (error) {
        console.error('Error searching lawyers:', error);
        throw error;
    }
};

export const getLawyers = async (): Promise<Lawyer[]> => {
    try {
        const response = await api.get('/api/lawyers');
        return response.data;
    } catch (error) {
        console.error('Error fetching all lawyers:', error);
        throw error;
    }
};

export const createLawyer = async (lawyerData: any): Promise<Lawyer> => {
    try {
        const response = await api.post('/api/lawyers', lawyerData);
        return response.data;
    } catch (error) {
        console.error('Error creating lawyer:', error);
        throw error;
    }
};

export const submitReview = async (review: any): Promise<any> => {
    try {
        const response = await api.post('/api/reviews', review);
        return response.data;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
};

export const submitLawyerReview = async (lawyerId: number, review: any): Promise<any> => {
    try {
        const response = await api.post(`/api/lawyers/${lawyerId}/reviews`, review);
        return response.data;
    } catch (error) {
        console.error('Error submitting lawyer review:', error);
        throw error;
    }
};

export const getLawyerReviews = async (lawyerId: number): Promise<Review[]> => {
    try {
        const response = await api.get(`/api/lawyers/${lawyerId}/reviews`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching reviews for lawyer ${lawyerId}:`, error);
        throw error;
    }
};
