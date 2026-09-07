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

export interface Rejection {
    id: number;
    rejection_quantity: string | number;
    rejection_category: string;
    rejection_reason: string;
    defect_location?: string | null;
    disposition: string;
    inspector_id?: string | null;
    inspected_at?: string;
    batch_no?: string;
    product_code?: string | null;
    product_name?: string | null;
}

export interface AuditAnswers {
    grade_produced: { code: string; name: string };
    heat_number: { heat_no: string; heat_date: string; melt_shop: string; total_input_qty: number; total_output_qty: number };
    raw_materials_used: Array<{ code: string; name: string; type: string; quantity: number; unit: string }>;
    billet_produced_qty: { cast_weight: number; current_remaining: number; unit: string; production_date: string };
    manufacturing_units_received: string[];
    transferred_qty_by_unit: Array<{ from_unit: string; to_unit: string; quantity: number; transfer_date: string; manifest_no?: string; vehicle_no?: string }>;
    products_manufactured: string[];
    finished_product_qty: { total_weight: number; unit: string; lots: Array<any> };
    material_rejected_qty: { total_rejected_weight: number; rejection_count: number; unit: string };
    rejection_reasons: Array<{ category: string; reason: string; defect_location?: string; quantity: number; disposition: string; batch_no?: string; inspector?: string; date?: string }>;
    scrap_and_waste_qty: { total_scrap_weight: number; reheating_scale_loss: number; crop_end_cut_scrap: number; recycled_to_sms_scrap: number; heat_melt_loss_share: number; unit: string };
    final_destination: { status: string; remaining_stock_in_yard: number; finished_products_destination: string[]; disposition_summary: string };
}

export interface TraceabilityData {
    billet: Billet;
    metrics?: BilletMetrics;
    source: Source;
    transfers: Transfer[];
    production: Production[];
    rejections?: Rejection[];
    audit_answers?: AuditAnswers;
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
    rejections?: Rejection[];
}

export interface HeatTraceabilityResponse {
    success: boolean;
    data: HeatTraceabilityData;
}


