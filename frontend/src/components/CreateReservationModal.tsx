import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateReservationPayload } from '../types';

interface CreateReservationModalProps {
    condominiumId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateReservationModal: React.FC<CreateReservationModalProps> = ({ condominiumId, onClose, onSuccess }) => {
    const [area, setArea] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'conflicts' | null>(null);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!area || !startTime) {
                setAvailabilityMessage('');
                setAvailabilityStatus(null);
                return;
            }

            setCheckingAvailability(true);
            setAvailabilityMessage('Verificando disponibilidade...');
            setAvailabilityStatus(null);

            try {
                // Extract date from datetime-local (YYYY-MM-DDTHH:mm)
                const datePart = startTime.split('T')[0];
                if (datePart) {
                    const response = await CondominiumService.checkAvailability(condominiumId, area, datePart);
                    if (response.available) {
                        setAvailabilityStatus('available');
                        setAvailabilityMessage('✅ Esta área está livre na data selecionada!');
                    } else {
                        setAvailabilityStatus('conflicts');
                        setAvailabilityMessage('⚠️ Indisponível: Já existem conflitos ou reservas para esta área no dia selecionado.');
                    }
                }
            } catch (err) {
                console.error('Error checking availability:', err);
                setAvailabilityMessage('');
                setAvailabilityStatus(null);
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkAvailability();
    }, [area, startTime, condominiumId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: CreateReservationPayload = { area, startTime, endTime, unitNumber };
            await CondominiumService.createReservation(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating reservation:', err);
            setError('Falha ao criar a reserva. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Nova Reserva</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Área</label>
                        <select required value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle}>
                            <option value="">Selecione uma área...</option>
                            <option value="Salão de Festas">Salão de Festas</option>
                            <option value="Churrasqueira">Churrasqueira</option>
                            <option value="Quadra Poliesportiva">Quadra Poliesportiva</option>
                            <option value="Piscina">Piscina</option>
                            <option value="Academia">Academia</option>
                            <option value="Espaço Gourmet">Espaço Gourmet</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Data e Hora Início</label>
                            <input type="datetime-local" required value={startTime} step="1" onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
                        </div>
                        
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Data e Hora Fim</label>
                            <input type="datetime-local" required value={endTime} step="1" onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    {availabilityMessage && (
                        <div style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            backgroundColor: availabilityStatus === 'available' ? '#f0fdf4' : availabilityStatus === 'conflicts' ? '#fffbeb' : '#f8fafc',
                            color: availabilityStatus === 'available' ? '#16a34a' : availabilityStatus === 'conflicts' ? '#d97706' : '#64748b',
                            border: `1px solid ${availabilityStatus === 'available' ? '#bbf7d0' : availabilityStatus === 'conflicts' ? '#fde68a' : '#e2e8f0'}`,
                            marginTop: '4px',
                            transition: 'all 0.2s ease-in-out'
                        }}>
                            {availabilityMessage}
                        </div>
                    )}

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Número da Unidade (Ex: 201, 202)</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Informe o número da sua unidade" 
                            value={unitNumber} 
                            onChange={(e) => setUnitNumber(e.target.value)} 
                            style={inputStyle} 
                        />
                    </div>
                    
                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading || checkingAvailability}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading || checkingAvailability}>
                            {loading ? 'Salvando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px'
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#334155'
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem'
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: 500,
    cursor: 'pointer'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1e40af',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer'
};

const errorStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.875rem',
    marginBottom: '16px'
};
