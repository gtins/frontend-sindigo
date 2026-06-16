export interface Condominium {
  id: string; // UUID
  name: string;
  address: string;
  unidades?: number;
  active?: boolean;
}

export interface CreateCondominiumPayload {
  name: string;
  address: string;
  unidades: number;
  active?: boolean;
}

export interface Activity {
  id: string; // Assuming UUID, but might be number depending on backend. We'll use string to be safe.
  title: string;
  description: string;
  type: string; // 'PERIODIC', etc.
  startDate: string;
  endDate: string;
  status?: string;
  closedAt?: string;
  closingNotes?: string;
  activityId?: string;
  ticketId?: string;
  origin?: string;
  providerId?: string;
  provider?: { id: string };
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
  requestedByName?: string;
  requestedByUnit?: string;
  createdAt?: string | null;
}

export interface CreateReservationPayload {
  area: string;
  startTime: string;
  endTime: string;
  unitNumber: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflictsFound: boolean;
  date: string;
  area: string;
  condominiumId: string;
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
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVIDO' | 'FECHADO' | 'ABERTO' | 'EM_EXECUCAO' | 'CANCELADO' | 'EM_ANALISE' | 'PLANEJADO' | 'AGUARDANDO' | 'CLOSED';
  location: string;
  createdAt?: string;
  closedAt?: string;
  closingNotes?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  priority: 'ALTA' | 'BAIXA' | 'MEDIA' | 'CRITICA' | 'URGENTE';
  location: string;
}

export interface CloseTicketPayload {
  status: 'RESOLVIDO' | 'FECHADO';
  closingNotes: string;
}

export interface CloseActivityPayload {
  status: 'COMPLETED' | 'CANCELLED';
  closingNotes: string;
}
