import api from './api';
import type {
  Condominium,
  CreateCondominiumPayload,
  Activity,
  CreateActivityPayload,
  Reservation,
  CreateReservationPayload,
  ReservationApprovalPayload,
  CloseActivityPayload,
  CloseTicketPayload,
  AvailabilityResponse
} from '../types';

const CondominiumService = {
  // Condominiums
  getAll: async (): Promise<Condominium[]> => {
    const response = await api.get('/condominiums');
    return response.data;
  },

  getMyCondominiums: async (): Promise<Condominium[]> => {
    const response = await api.get('/condominiums/my-condominiums');
    return response.data;
  },

  getById: async (id: string): Promise<Condominium> => {
    const response = await api.get(`/condominiums/${id}`);
    return response.data;
  },

  create: async (payload: CreateCondominiumPayload): Promise<Condominium> => {
    const response = await api.post('/condominiums', payload);
    return response.data;
  },

  // Members
  getMembers: async (condominiumId: string): Promise<any[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/members`);
    return response.data;
  },

  addMember: async (condominiumId: string, userId: string): Promise<void> => {
    await api.post(`/condominiums/${condominiumId}/members/${userId}`);
  },

  removeMember: async (condominiumId: string, userId: string): Promise<void> => {
    await api.delete(`/condominiums/${condominiumId}/members/${userId}`);
  },

  // Activities
  getActivities: async (condominiumId: string): Promise<Activity[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/activities`);
    return response.data;
  },

  createActivity: async (condominiumId: string, payload: CreateActivityPayload): Promise<Activity> => {
    const response = await api.post(`/condominiums/${condominiumId}/activities`, payload);
    return response.data;
  },

  closeActivity: async (condominiumId: string, activityId: string, payload: CloseActivityPayload): Promise<Activity> => {
    const response = await api.post(`/condominiums/${condominiumId}/activities/${activityId}/close`, payload);
    return response.data;
  },

  // Reservations
  getReservations: async (condominiumId: string): Promise<Reservation[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/reservations`);
    return response.data;
  },

  createReservation: async (condominiumId: string, payload: CreateReservationPayload): Promise<Reservation> => {
    const response = await api.post(`/condominiums/${condominiumId}/reservations`, payload);
    return response.data;
  },

  approveReservation: async (condominiumId: string, reservationId: string, payload: ReservationApprovalPayload): Promise<Reservation> => {
    const response = await api.patch(`/condominiums/${condominiumId}/reservations/${reservationId}`, payload);
    return response.data;
  },

  checkAvailability: async (condominiumId: string, area: string, date: string): Promise<AvailabilityResponse> => {
    const response = await api.get(`/condominiums/${condominiumId}/reservations/availability`, {
      params: { area, date }
    });
    return response.data;
  },

  // Finances
  getFinancialEntries: async (condominiumId: string): Promise<any[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/financial-entries`);
    return response.data;
  },

  getFinanceBalance: async (condominiumId: string): Promise<any> => {
    const response = await api.get(`/condominiums/${condominiumId}/balance`);
    return response.data;
  },

  createFinancialEntry: async (condominiumId: string, payload: any): Promise<any> => {
    const response = await api.post(`/condominiums/${condominiumId}/financial-entries`, payload);
    return response.data;
  },

  // Providers
  getProviders: async (condominiumId: string): Promise<any[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/providers`);
    return response.data;
  },

  getProviderById: async (condominiumId: string, providerId: string): Promise<any> => {
    const response = await api.get(`/condominiums/${condominiumId}/providers/${providerId}`);
    return response.data;
  },

  createProvider: async (condominiumId: string, payload: any): Promise<any> => {
    const response = await api.post(`/condominiums/${condominiumId}/providers`, payload);
    return response.data;
  },

  updateProvider: async (condominiumId: string, providerId: string, payload: any): Promise<any> => {
    const response = await api.put(`/condominiums/${condominiumId}/providers/${providerId}`, payload);
    return response.data;
  },

  deleteProvider: async (condominiumId: string, providerId: string): Promise<void> => {
    await api.delete(`/condominiums/${condominiumId}/providers/${providerId}`);
  },

  // Tickets
  getTickets: async (condominiumId: string): Promise<any[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/tickets`);
    return response.data;
  },

  getTicketById: async (condominiumId: string, ticketId: string): Promise<any> => {
    const response = await api.get(`/condominiums/${condominiumId}/tickets/${ticketId}`);
    return response.data;
  },

  createTicket: async (condominiumId: string, payload: any): Promise<any> => {
    const response = await api.post(`/condominiums/${condominiumId}/tickets`, payload);
    return response.data;
  },

  updateTicket: async (condominiumId: string, ticketId: string, payload: any): Promise<any> => {
    const response = await api.put(`/condominiums/${condominiumId}/tickets/${ticketId}`, payload);
    return response.data;
  },

  deleteTicket: async (condominiumId: string, ticketId: string): Promise<void> => {
    await api.delete(`/condominiums/${condominiumId}/tickets/${ticketId}`);
  },

  closeTicket: async (condominiumId: string, ticketId: string, payload: CloseTicketPayload): Promise<any> => {
    const response = await api.post(`/condominiums/${condominiumId}/tickets/${ticketId}/close`, payload);
    return response.data;
  }
};

export default CondominiumService;
