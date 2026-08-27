export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    unit_id: number | null;
    unit_code?: string | null;
    unit_name?: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    unit_id?: number | null;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: User;
}