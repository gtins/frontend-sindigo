export interface Condominium {
  id: string; // UUID
  name: string;
  address: string;
}

export interface CreateCondominiumPayload {
  name: string;
  address: string;
}

export interface Activity {
  id: string; // Assuming UUID, but might be number depending on backend. We'll use string to be safe.
  title: string;
  description: string;
  type: string; // 'PERIODIC', etc.
  startDate: string;
  endDate: string;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  type: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

export interface Reservation {
  id: string; // UUID
  condominiumId: string;
  title?: string;
  description?: string;
  date?: string;
  // Fallbacks based on typical reservation fields since we don't know the exact schema
}
