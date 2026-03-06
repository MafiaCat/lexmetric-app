export interface User {
    id: number;
    email: string;
    full_name: string;
    company_id: number;
    role: string;
}

export interface Lawyer {
    id: number;
    first_name: string;
    last_name: string;
    bar_association: string;
    oath_date: string;
    city: string;
    firm_type: string;
    specialties: string[];
    in_network: boolean;
    average_hourly_rate: number;
    law_firm_id: number | null;
    matching_score?: number; // Added from search backend
    status?: string; // "pending", "approved", "rejected"
}

export interface Review {
    id: number;
    reactivity_score: number;
    technical_expertise_score: number;
    negotiation_score: number;
    fee_respect_score: number;
    comment?: string;
    mission_id: number;
    created_at: string;
}

export interface SearchParams {
    specialty: string;
    complexity: number;
    financial_stakes: number;
}

export interface SupportTicket {
    id: number;
    user_id: number;
    company_id: number;
    ticket_type: 'profile_update' | 'fake_review_report' | 'bug_report' | 'feature_request' | 'billing_issue' | 'other';
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    updated_at: string;
}
