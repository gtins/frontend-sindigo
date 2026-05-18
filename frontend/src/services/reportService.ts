import api from './api';

const downloadFile = (response: any, defaultFilename: string) => {
    // Extract filename from Content-Disposition header if possible
    let filename = defaultFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    if (link.parentNode) {
        link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
};

const ReportService = {
    exportAll: async (condominiumId: string) => {
        const response = await api.get(`/condominiums/${condominiumId}/reports/financial.csv`, {
            responseType: 'blob'
        });
        downloadFile(response, 'relatorio-financeiro.csv');
    },

    exportByPeriod: async (condominiumId: string, startDate: string, endDate: string) => {
        const response = await api.get(`/condominiums/${condominiumId}/reports/financial/period.csv`, {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        downloadFile(response, `relatorio-financeiro-${startDate}-ate-${endDate}.csv`);
    },

    exportIncomeOnly: async (condominiumId: string) => {
        const response = await api.get(`/condominiums/${condominiumId}/reports/financial/income.csv`, {
            responseType: 'blob'
        });
        downloadFile(response, 'relatorio-entradas.csv');
    },

    exportExpenseOnly: async (condominiumId: string) => {
        const response = await api.get(`/condominiums/${condominiumId}/reports/financial/expense.csv`, {
            responseType: 'blob'
        });
        downloadFile(response, 'relatorio-saidas.csv');
    },

    exportByMonth: async (condominiumId: string, month: string) => {
        const response = await api.get(`/condominiums/${condominiumId}/reports/financial/month.csv`, {
            params: { month },
            responseType: 'blob'
        });
        downloadFile(response, `relatorio-financeiro-${month}.csv`);
    }
};

export default ReportService;
