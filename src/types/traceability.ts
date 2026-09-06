export interface Billet {
    id: number;
    billet_no: string;
    quantity: string | number;
    consumed_quantity?: number;
    remaining_quantity?: number;
    unit: string;
    production_date: string;
    status: string;
}

export interface BilletMetrics {
    initial_quantity: number;
    consumed_quantity: number;
    remaining_quantity: number;
    production_scrap: number;
    heat_melt_loss: number;
    total_material_rejected: number;
    unit: string;
}

export interface Heat {
    id: number;
    heat_no: string;
    heat_date: string;
    start_time?: string | null;
    end_time?: string | null;
    total_input_qty?: number;
    total_output_qty?: number;
    unit?: string;
    status?: string;
    remarks?: string | null;
    grade_code?: string;
    grade_name?: string;
    grade?: Grade;
    unit_info?: {
        code: string;
        name: string;
    };
}

export interface Grade {
    id: number;
    code: string;
    name: string;
}

export interface Material {
    id: number;
    material_code?: string;
    material_name?: string;
    material_type?: string;
    quantity?: string | number;
    unit?: string;
    added_at?: string;
    remarks?: string | null;
}

export interface Source {
    heat: Heat;
    grade: Grade;
    materials: Material[];
}

export interface Transfer {
    id: number;
    billet_id?: number;
    billet_no?: string;
    from_unit: string;
    from_unit_name: string;
    to_unit: string;
    to_unit_name: string;
    quantity: string | number;
    transfer_date: string;
    transfer_type: string | null;
    remarks: string | null;
}

export interface Production {
    batch_id: number;
    batch_no: string;
    unit_code: string;
    unit_name: string;
    production_date: string;
    billet_id?: number;
    billet_no?: string;
    billet_consumed: string | number;
    product_code: string | null;
    product_name: string | null;
    product_type: string | null;
    product_quantity: string | number | null;
}

export interface TraceabilityData {
    billet: Billet;
    metrics?: BilletMetrics;
    source: Source;
    transfers: Transfer[];
    production: Production[];
}

export interface TraceabilityResponse {
    success: boolean;
    data: TraceabilityData;
}

export interface DetailedBillet {
    id: number;
    billet_no: string;
    quantity: number;
    consumed_quantity: number;
    remaining_quantity: number;
    unit: string;
    production_date: string;
    status: string;
    grade_code?: string;
    grade_name?: string;
    transfers: Transfer[];
    production: Production[];
}

export interface HeatMetrics {
    total_billets_count: number;
    total_billets_qty: number;
    consumed_billets_count: number;
    consumed_billets_qty: number;
    remaining_billets_count: number;
    remaining_billets_qty: number;
    heat_melt_loss_qty: number;
    production_scrap_qty: number;
    total_material_rejected_qty: number;
    yield_percentage: number;
    unit: string;
}

export interface HeatTraceabilityData {
    heat: Heat;
    metrics: HeatMetrics;
    materials: Material[];
    billets: DetailedBillet[];
    transfers: Transfer[];
    production: Production[];
}

export interface HeatTraceabilityResponse {
    success: boolean;
    data: HeatTraceabilityData;
}

