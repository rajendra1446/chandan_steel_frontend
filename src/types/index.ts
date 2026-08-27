export interface Grade {
  id: number;
  grade_code: string;
  grade_name: string;
  description?: string;
  created_at?: string;
}

export interface Material {
  id: number;
  material_code: string;
  material_name: string;
  material_type: 'SCRAP' | 'ALLOY' | 'ADDITIVE' | 'OTHER';
  unit: string;
}

export interface Heat {
  id: number;
  heat_no: string;
  grade_id: number;
  grade_code: string;
  grade_name: string;
  unit_code: string;
  unit_name: string;
  heat_date: string;
  total_input_qty: string | number;
  total_output_qty: string | number;
  status: string;
  remarks?: string;
}

export interface Billet {
  id: number;
  billet_no: string;
  quantity: string | number;
  unit: string;
  production_date: string;
  status: string;
  heat_no: string;
  grade_code: string;
  grade_name: string;
}