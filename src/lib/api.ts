import { TraceabilityData, HeatTraceabilityData, DetailedBillet } from "../types/traceability";


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

    billet_id?: number | null;
    billet_no?: string | null;
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

export interface Material {
    id: number;
    material_code: string;
    material_name: string;
    material_type: string;
    unit: string;
}

export interface HeatMaterial {
    id: number;
    heat_id: number;
    material_id: number;
    material_code: string;
    material_name: string;
    material_type: string;
    quantity: number | string;
    unit: string;
    added_at: string;
    remarks?: string | null;
}

export interface Heat {
    id: number;
    heat_no: string;
    grade_id: number;
    grade_code: string;
    grade_name: string;
    unit_id?: number | null;
    unit_code?: string | null;
    unit_name?: string | null;
    heat_date: string;
    start_time?: string | null;
    end_time?: string | null;
    total_input_qty: number | string;
    total_output_qty: number | string;
    status: string;
    remarks?: string | null;
    created_at?: string;
    billets_count?: number;
    billets_total_qty?: number;
    materials_count?: number;
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
    // GRADES
    // ====================================

    getGrades: () =>
        request<{
            success: boolean;
            count: number;
            data: Array<{
                id: number;
                grade_code: string;
                grade_name: string;
                description: string | null;
            }>;
        }>("/grades"),

    // ====================================
    // MATERIALS MASTER
    // ====================================

    getMaterials: () =>
        request<{
            success: boolean;
            count: number;
            data: Material[];
        }>("/materials"),

    createMaterial: (data: {
        material_code: string;
        material_name: string;
        material_type: string;
        unit?: string;
    }) =>
        request<{
            success: boolean;
            data: Material;
        }>("/materials", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ====================================
    // HEATS
    // ====================================

    getHeats: () =>
        request<{
            success: boolean;
            count: number;
            data: Heat[];
        }>("/heats"),

    getHeat: (id: string | number) =>
        request<{
            success: boolean;
            data: Heat;
        }>(`/heats/${encodeURIComponent(id)}`),

    createHeat: (data: {
        heat_no: string;
        grade_id: number;
        heat_date: string;
        start_time?: string | null;
        end_time?: string | null;
        total_input_qty?: number;
        total_output_qty?: number;
        remarks?: string | null;
    }) =>
        request<{
            success: boolean;
            message: string;
            data: Heat;
        }>("/heats", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    addHeatMaterial: (
        heatId: number | string,
        data: {
            material_id: number;
            quantity: number;
            unit?: string;
            remarks?: string | null;
        }
    ) =>
        request<{
            success: boolean;
            message: string;
            data: HeatMaterial;
        }>(`/heats/${heatId}/materials`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getHeatMaterials: (heatId: number | string) =>
        request<{
            success: boolean;
            count: number;
            data: HeatMaterial[];
        }>(`/heats/${heatId}/materials`),

    getHeatBillets: (heatId: number | string) =>
        request<{
            success: boolean;
            count: number;
            data: Array<{
                id: number;
                billet_no: string;
                quantity: number | string;
                consumed_quantity: number | string;
                remaining_quantity: number | string;
                unit: string;
                production_date: string;
                status: string;
                grade_code: string;
                grade_name: string;
            }>;
        }>(`/heats/${heatId}/billets`),

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
    // BILLETS
    // ====================================

    getBillets: () =>
        request<{
            success: boolean;
            count: number;
            data: Array<{
                id: number;
                billet_no: string;
                quantity: number | string;
                consumed_quantity?: number;
                remaining_quantity?: number;
                unit: string;
                production_date: string;
                status: string;
                heat_no: string;
                grade_code: string;
                grade_name: string;
            }>;
        }>("/billets"),

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
        billet_id?: number | null;
        billet_consumed?: number | null;
        production_date?: string;
        remarks?: string | null;
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

    getHeatTraceability: async (heatNo: string) => {
        const cleanHeat = heatNo.trim();
        try {
            return await request<{
                success: boolean;
                data: HeatTraceabilityData;
            }>(`/traceability/heat/${encodeURIComponent(cleanHeat)}`);
        } catch (err: any) {
            // If route not found on remote deployment or heat missing, use client synthesis fallback
            if (
                err?.message?.includes("API route not found") ||
                err?.message?.includes("not found")
            ) {
                return await fallbackHeatTraceability(cleanHeat);
            }
            throw err;
        }
    },
};

// ========================================
// RESILIENT HEAT TRACEABILITY FALLBACK
// ========================================
async function fallbackHeatTraceability(
    heatNo: string
): Promise<{ success: boolean; data: HeatTraceabilityData }> {
    const cleanHeat = heatNo.trim();

    // 1. Fetch billets and heats
    const [billetsRes, heatsRes] = await Promise.all([
        api.getBillets().catch(() => ({ success: true, count: 0, data: [] })),
        api.getHeats().catch(() => ({ success: true, count: 0, data: [] })),
    ]);

    const matchingBillets = (billetsRes.data || []).filter(
        (b) =>
            b.heat_no?.toLowerCase() === cleanHeat.toLowerCase() ||
            String(b.heat_no) === cleanHeat
    );

    const heatRecord = (heatsRes.data || []).find(
        (h) =>
            h.heat_no?.toLowerCase() === cleanHeat.toLowerCase() ||
            String(h.id) === cleanHeat
    );

    if (matchingBillets.length === 0 && !heatRecord) {
        throw new Error(`Heat "${cleanHeat}" not found`);
    }

    // 2. Fetch individual billet traces in parallel
    const billetTraces = await Promise.all(
        matchingBillets.map((b) =>
            api
                .getBilletTraceability(b.billet_no)
                .then((r) => r.data)
                .catch(() => null)
        )
    );

    const validTraces = billetTraces.filter(Boolean) as TraceabilityData[];

    // 3. Aggregate metrics
    let totalBilletsQty = 0;
    let consumedBilletsQty = 0;
    let remainingBilletsQty = 0;
    let consumedBilletsCount = 0;
    let remainingBilletsCount = 0;
    let productionScrapQty = 0;

    const detailedBillets: DetailedBillet[] = matchingBillets.map((b) => {
        const trace = validTraces.find(
            (t) => t.billet.id === b.id || t.billet.billet_no === b.billet_no
        );
        const initial = Number(b.quantity) || 0;
        const consumed = trace?.metrics
            ? trace.metrics.consumed_quantity
            : Number(b.consumed_quantity) || 0;
        const remaining = trace?.metrics
            ? trace.metrics.remaining_quantity
            : Number(b.remaining_quantity) || Math.max(0, initial - consumed);

        totalBilletsQty += initial;
        consumedBilletsQty += consumed;
        remainingBilletsQty += remaining;
        if (consumed > 0) consumedBilletsCount++;
        if (remaining > 0) remainingBilletsCount++;
        if (trace?.metrics) productionScrapQty += trace.metrics.production_scrap;

        return {
            id: b.id,
            billet_no: b.billet_no,
            quantity: initial,
            consumed_quantity: consumed,
            remaining_quantity: remaining,
            unit: b.unit || "KG",
            production_date: b.production_date,
            status: b.status,
            grade_code: b.grade_code,
            grade_name: b.grade_name,
            transfers: trace ? trace.transfers : [],
            production: trace ? trace.production : [],
        };
    });

    const heatInputQty = heatRecord
        ? Number(heatRecord.total_input_qty) || 0
        : (validTraces[0]?.source?.heat?.total_input_qty || totalBilletsQty);
    const heatOutputQty = heatRecord
        ? Number(heatRecord.total_output_qty) || 0
        : (validTraces[0]?.source?.heat?.total_output_qty || totalBilletsQty);
    const heatMeltLossQty = Math.max(0, heatInputQty - heatOutputQty);
    const totalRejected = heatMeltLossQty + productionScrapQty;
    const yieldPct =
        heatInputQty > 0
            ? Number((((heatInputQty - totalRejected) / heatInputQty) * 100).toFixed(1))
            : 100.0;

    const materials = validTraces[0]?.source?.materials || [];

    // Collect all transfers & production from detailed billets
    const allTransfers = detailedBillets.flatMap((b) => b.transfers);
    const allProduction = detailedBillets.flatMap((b) => b.production);

    const data: HeatTraceabilityData = {
        heat: {
            id: heatRecord?.id || validTraces[0]?.source?.heat?.id || 0,
            heat_no: heatRecord?.heat_no || cleanHeat,
            heat_date:
                heatRecord?.heat_date ||
                validTraces[0]?.source?.heat?.heat_date ||
                new Date().toISOString(),
            start_time: heatRecord?.start_time || null,
            end_time: heatRecord?.end_time || null,
            total_input_qty: heatInputQty,
            total_output_qty: heatOutputQty,
            unit: "KG",
            status: heatRecord?.status || "COMPLETED",
            remarks: heatRecord?.remarks || null,
            grade: {
                id: heatRecord?.grade_id || 0,
                code:
                    heatRecord?.grade_code ||
                    matchingBillets[0]?.grade_code ||
                    "-",
                name:
                    heatRecord?.grade_name ||
                    matchingBillets[0]?.grade_name ||
                    "-",
            },
            unit_info: {
                code: heatRecord?.unit_code || "SMS",
                name: heatRecord?.unit_name || "Steel Melting Shop",
            },
        },
        metrics: {
            total_billets_count: matchingBillets.length,
            total_billets_qty: totalBilletsQty,
            consumed_billets_count: consumedBilletsCount,
            consumed_billets_qty: consumedBilletsQty,
            remaining_billets_count: remainingBilletsCount,
            remaining_billets_qty: remainingBilletsQty,
            heat_melt_loss_qty: heatMeltLossQty,
            production_scrap_qty: productionScrapQty,
            total_material_rejected_qty: totalRejected,
            yield_percentage: yieldPct,
            unit: "KG",
        },
        materials,
        billets: detailedBillets,
        transfers: allTransfers,
        production: allProduction,
    };

    return { success: true, data };
}



