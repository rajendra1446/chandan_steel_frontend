export interface Product {
    id: number;
    product_code: string;
    product_name: string;
    product_type: string | null;
    unit_code?: string | null;
    unit_name?: string | null;
    unit_id?: number | null;
}

export interface CreateProductRequest {
    product_code: string;
    product_name: string;
    product_type?: string | null;
    unit_id?: number | null;
}

export interface ProductsResponse {
    success: boolean;
    count: number;
    data: Product[];
}
export interface ProductResponse {
    success: boolean;
    data: Product;
}