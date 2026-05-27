import api from './api';

export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  s3ObjectKey: string;
}

const AttachmentService = {
  getTicketAttachments: async (ticketId: string): Promise<Attachment[]> => {
    const response = await api.get(`/api/v1/attachments/ticket/${ticketId}`);
    return response.data;
  },

  getActivityAttachments: async (activityId: string): Promise<Attachment[]> => {
    const response = await api.get(`/api/v1/attachments/activity/${activityId}`);
    return response.data;
  },

  getProviderAttachments: async (providerId: string): Promise<Attachment[]> => {
    const response = await api.get(`/api/v1/attachments/provider/${providerId}`);
    return response.data;
  },

  getPresignedUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/api/v1/attachments/${id}/presigned-url`);
    if (typeof response.data === 'string') {
      return response.data;
    }
    return response.data.url || response.data.presignedUrl;
  },

  deleteAttachment: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/attachments/${id}`);
  },

  uploadTicketAttachment: async (ticketId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/v1/attachments/ticket/${ticketId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadActivityAttachment: async (activityId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/v1/attachments/activity/${activityId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadProviderAttachment: async (providerId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/v1/attachments/provider/${providerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default AttachmentService;
