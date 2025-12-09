export interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours: string;
  created_at: string;
  created_by?: string;
}

export interface Availability {
  id: string;
  pharmacy_id: string;
  medication_id: string;
  in_stock: boolean;
  price?: number;
  last_updated: string;
  updated_by?: string;
  pharmacy?: Pharmacy;
  medication?: Medication;
}

export interface ModerationFlag {
  id: string;
  availability_id: string;
  reason: string;
  flagged_by: string;
  created_at: string;
  resolved: boolean;
}

export interface User {
  id: string;
  email: string;
}