export interface Lawyer {
    id: number;
    first_name: string;
    last_name: string;
    bar_association: string;
    oath_date: string;
    specialties: string[];
    in_network: boolean;
    average_hourly_rate: number;
    law_firm_id: number | null;
    matching_score?: number; // Added from search backend
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
