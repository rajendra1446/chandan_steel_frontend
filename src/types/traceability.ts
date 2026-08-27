export interface Billet {
    id: number;
    billet_no: string;
    quantity: string;
    unit: string;
    production_date: string;
    status: string;
}

export interface Heat {
    id: number;
    heat_no: string;
    heat_date: string;
}

export interface Grade {
    id: number;
    code: string;
    name: string;
}

export interface Material {
    id: number;
    material_name?: string;
    quantity?: string;
}

export interface Source {
    heat: Heat;
    grade: Grade;
    materials: Material[];
}

export interface Transfer {
    id: number;
    from_unit: string;
    from_unit_name: string;
    to_unit: string;
    to_unit_name: string;
    quantity: string;
    transfer_date: string;
    transfer_type: string;
    remarks: string | null;
}

export interface Production {
    batch_id: number;
    batch_no: string;
    unit_code: string;
    unit_name: string;
    production_date: string;
    billet_consumed: string;
    product_code: string | null;
    product_name: string | null;
    product_type: string | null;
    product_quantity: string | null;
}

export interface TraceabilityData {
    billet: Billet;
    source: Source;
    transfers: Transfer[];
    production: Production[];
}

export interface TraceabilityResponse {
    success: boolean;
    data: TraceabilityData;
}
