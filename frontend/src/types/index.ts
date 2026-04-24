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
  ticketId?: string;
  origin?: string;
  providerId?: string;
}

export interface Reservation {
  id: string; // UUID
  condominiumId: string;
  area: string;
  startTime: string;
  endTime: string;
  status?: string;
  requestedBy?: string;
  createdAt?: string | null;
}

export interface CreateReservationPayload {
  area: string;
  startTime: string;
  endTime: string;
}

export interface ReservationApprovalPayload {
  status: 'CONFIRMED' | 'CANCELLED';
  reason?: string;
}

export interface FinancialEntry {
  id: string; // UUID
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
  category?: string;
  account?: string;
}

export interface CreateFinancialEntryPayload {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface Balance {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface Provider {
  id: string; // UUID
  condominiumId: string;
  name: string;
  serviceType: 'ELECTRICIAN' | 'PLUMBER' | 'GARDENER' | 'CARPENTER' | 'OTHER';
  phone: string;
  email?: string;
  notes?: string;
}

export interface CreateProviderPayload {
  name: string;
  serviceType: 'ELECTRICIAN' | 'PLUMBER' | 'GARDENER' | 'CARPENTER' | 'OTHER';
  phone: string;
  email?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  condominiumId: string;
  title: string;
  description: string;
  category: string;
  priority: 'ALTA' | 'BAIXA' | 'MEDIA' | 'CRITICA' | 'URGENTE';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  location: string;
  createdAt?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  priority: 'ALTA' | 'BAIXA' | 'MEDIA' | 'CRITICA' | 'URGENTE';
  location: string;
}
