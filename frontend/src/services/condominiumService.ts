import api from './api';
import type { 
  Condominium, 
  CreateCondominiumPayload, 
  Activity, 
  CreateActivityPayload, 
  Reservation 
} from '../types';

const CondominiumService = {
  // Condominiums
  getAll: async (): Promise<Condominium[]> => {
    const response = await api.get('/condominiums');
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

  // Activities
  getActivities: async (condominiumId: string): Promise<Activity[]> => {
    const response = await api.get(`/condominiums/${condominiumId}/activities`);
    return response.data;
  },

  createActivity: async (condominiumId: string, payload: CreateActivityPayload): Promise<Activity> => {
    const response = await api.post(`/condominiums/${condominiumId}/activities`, payload);
    return response.data;
  },

  // Reservations
  getReservations: async (condominiumId: string): Promise<Reservation[]> => {
    const response = await api.get(`/reservations?condominiumId=${condominiumId}`);
    return response.data;
  }
};

export default CondominiumService;
