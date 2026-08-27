import { TraceabilityData } from "../types/traceability";


const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://chandan-steel-backend-4.onrender.com/api";

// ========================================
// REQUEST HELPER
// ========================================

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {}),

                ...(options.headers || {}),
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
}

// ========================================
// TYPES
// ========================================

export interface Unit {
    id: number;
    unit_code: string;
    unit_name: string;
    parent_code?: string | null;
    parent_name?: string | null;
    is_active: boolean;
}

export interface Product {
    id: number;
    product_code: string;
    product_name: string;
    product_type: string | null;
    unit_code?: string | null;
    unit_name?: string | null;
}

export interface ProductionBatch {
    id: number;
    batch_no: string;

    unit_code: string;
    unit_name: string;

    production_date: string;

    input_quantity: string;
    output_quantity: string;

    unit: string;
    status: string;

    remarks: string | null;

    billet_consumed: string | null;
    product_code: string | null;
    product_name: string | null;
    product_type: string | null;
    product_quantity: string | null;
}
export interface Transfer {
    id: number;
    billet_id?: number;
    billet_no?: string;

    from_unit: string;
    from_unit_name?: string;

    to_unit: string;
    to_unit_name?: string;

    quantity: string;
    transfer_date: string;

    transfer_type: string;
    remarks: string | null;
}
// ========================================
// API
// ========================================

export const api = {

    // ====================================
    // AUTH
    // ====================================

    login: (data: {
        email: string;
        password: string;
    }) =>
        request<{
            success: boolean;
            message: string;
            token: string;

            user: {
                id: number;
                name: string | null;
                email: string;
                role: string;
                unit_id: number | null;
                unit_code: string | null;
                unit_name: string | null;
            };
        }>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // UNITS
    // ====================================

    getUnits: () =>
        request<{
            success: boolean;
            count: number;
            data: Unit[];
        }>("/units"),

    createUnit: (data: {
        unit_code: string;
        unit_name: string;
        parent_unit_id?: number | null;
    }) =>
        request<{
            success: boolean;
            data: Unit;
        }>("/units", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // PRODUCTS
    // ====================================

    getProducts: () =>
        request<{
            success: boolean;
            count: number;
            data: Product[];
        }>("/products"),

    createProduct: (data: {
        product_code: string;
        product_name: string;
        product_type?: string | null;
        unit_id?: number | null;
    }) =>
        request<{
            success: boolean;
            data: Product;
        }>("/products", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // PRODUCTION
    // ====================================

    getProduction: () =>
        request<{
            success: boolean;
            count: number;
            data: ProductionBatch[];
        }>("/production"),

    createProduction: (data: {
        batch_no: string;
        unit_id: number;
        billet_id: number;
        billet_consumed: number;
    }) =>
        request<{
            success: boolean;
            message: string;
            data: ProductionBatch;
        }>("/production", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // ADD BILLET INPUT
    // ====================================

    addProductionInput: (
        batchId: number,
        data: {
            billet_id: number;
            quantity: number;
        }
    ) =>
        request<{
            success: boolean;
            message: string;
            data: unknown;
        }>(
            `/production/${batchId}/inputs`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        ),

    // ====================================
    // ADD PRODUCTION OUTPUT
    // ====================================

    addProductionOutput: (
        batchId: number,
        data: {
            product_id: number;
            quantity: number;
        }
    ) =>
        request<{
            success: boolean;
            message: string;
            data: unknown;
        }>(
            `/production/${batchId}/outputs`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        ),

    // ====================================
    // TRANSFERS
    // ====================================

    
    getTransfers: () =>
        request<{
            success: boolean;
            count: number;
            data: Transfer[];
        }>("/transfers"),

    createTransfer: (data: {
        billet_id: number;
        from_unit_id: number | null;
        to_unit_id: number;
        quantity: number;
        transfer_type?: string;
        remarks?: string;
    }) =>
        request<{
            success: boolean;
            message: string;
            data: Transfer;
        }>("/transfers", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // TRACEABILITY
    // ====================================

    getBilletTraceability: (billetNo: string) =>
        request<{
            success: boolean;
            data: TraceabilityData;
        }>(
            `/traceability/billet/${encodeURIComponent(billetNo)}`
        ),
};


