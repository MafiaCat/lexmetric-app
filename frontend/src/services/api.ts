import axios from 'axios';
import { Lawyer, SearchParams, Review, User, SupportTicket } from '../types';

// Fallback for Vite env variable to fix TypeScript error
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://lexmetric-app.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to always add the company_id of the current user to the request headers
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('lexmetric_auth_user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user) {
                if (user.company_id) config.headers.set('x-company-id', user.company_id.toString());
                if (user.id) config.headers.set('x-user-id', user.id.toString());
                if (user.role) config.headers.set('x-user-role', user.role);
            }
        } catch (e) {
            console.error("Failed to parse user for auth header", e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
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

// --- AUTHENTICATION API --- //
export const getDemoUsers = async (): Promise<User[]> => {
    const response = await api.get('/api/auth/demo-users');
    return response.data;
};

export const getAdminUsers = async (): Promise<User[]> => {
    const response = await api.get('/api/admin/users');
    return response.data;
};

export const updateUserRole = async (userId: number, role: string): Promise<User> => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
};

// --- MODERATION API --- //
export const getPendingLawyers = async (): Promise<Lawyer[]> => {
    const response = await api.get('/api/moderation/lawyers/pending');
    return response.data;
};

export const updateLawyerStatus = async (lawyerId: number, status: string): Promise<Lawyer> => {
    const response = await api.put(`/api/moderation/lawyers/${lawyerId}/status`, { status });
    return response.data;
};

export const updateAdminLawyer = async (lawyerId: number, data: any): Promise<Lawyer> => {
    const response = await api.put(`/api/admin/lawyers/${lawyerId}`, data);
    return response.data;
};

export const getAdminStats = async (): Promise<any> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
};

export const getAdminReviews = async (): Promise<Review[]> => {
    const response = await api.get('/api/admin/reviews');
    return response.data;
};

export const deleteAdminReview = async (reviewId: number): Promise<any> => {
    const response = await api.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
};

export const getAdminAuditLogs = async (): Promise<any[]> => {
    const response = await api.get('/api/admin/audit-logs');
    return response.data;
};

export const getTickets = async (): Promise<SupportTicket[]> => {
    const response = await api.get('/api/moderation/tickets');
    return response.data;
};

export const updateTicketStatus = async (ticketId: number, status: string): Promise<SupportTicket> => {
    const response = await api.put(`/api/moderation/tickets/${ticketId}/status`, { status });
    return response.data;
};

export const updateTicketType = async (ticketId: number, ticketType: string): Promise<SupportTicket> => {
    const response = await api.put(`/api/moderation/tickets/${ticketId}/type`, { ticket_type: ticketType });
    return response.data;
};

export const createTicket = async (ticketData: any): Promise<SupportTicket> => {
    const response = await api.post('/api/tickets', ticketData);
    return response.data;
};

export const getTicketMessages = async (ticketId: number): Promise<any[]> => {
    const response = await api.get(`/api/tickets/${ticketId}/messages`);
    return response.data;
};

export const createTicketMessage = async (ticketId: number, content: string): Promise<any> => {
    const response = await api.post(`/api/tickets/${ticketId}/messages`, { content });
    return response.data;
};

export const getMyTickets = async (): Promise<SupportTicket[]> => {
    const response = await api.get('/api/users/me/tickets');
    return response.data;
};
