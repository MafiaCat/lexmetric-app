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
    source?: string; // "cnb_import", "manual_entry", "user_submission"
    is_verified?: boolean;
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
    // New factual fields
    actual_fees_paid?: number;
    fee_billing_type?: 'forfait' | 'heure' | 'success_fee';
    mission_type?: 'conseil' | 'contentieux' | 'negociation' | 'autre';
    mission_outcome?: 'gagné' | 'perdu' | 'accord_amiable' | 'en_cours' | 'abandon';
    mission_duration_days?: number;
    would_recommend?: boolean;
}

export interface LawyerStats {
    review_count: number;
    avg_reactivity?: number;
    avg_technical?: number;
    avg_negotiation?: number;
    avg_fee_respect?: number;
    recommend_rate?: number;
    median_fees_paid?: number;
    avg_mission_duration_days?: number;
    mission_outcome_distribution: Record<string, number>;
    mission_type_distribution: Record<string, number>;
    fee_billing_type_distribution: Record<string, number>;
}


export interface LawFirm {
    id: number;
    name: string;
    size?: number;
}

export interface PaginatedFirms {
    items: LawFirm[];
    total: number;
    page: number;
    size: number;
    pages: number;
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

export interface TicketMessage {
    id: number;
    ticket_id: number;
    sender_id: number;
    content: string;
    created_at: string;
}
