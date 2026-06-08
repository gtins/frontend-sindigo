import React, { useState, useEffect } from 'react';
import { X, Info, Check, Calendar } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateReservationPayload } from '../types';
import { CustomSelect } from './CustomSelect';


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

            // Validar antecedência mínima de 7 dias
            const start = new Date(startTime);
            const now = new Date();
            const minStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            if (start < minStartDate) {
                setAvailabilityStatus('conflicts');
                setAvailabilityMessage('⚠️ Inválido: Reservas precisam ser feitas com no mínimo 7 dias de antecedência.');
                return;
            }

            // Validar período máximo de 6 horas se o horário de fim estiver preenchido
            if (endTime) {
                const end = new Date(endTime);
                const durationMs = end.getTime() - start.getTime();
                if (durationMs <= 0) {
                    setAvailabilityStatus('conflicts');
                    setAvailabilityMessage('⚠️ Inválido: A data de fim deve ser posterior à data de início.');
                    return;
                }
                if (durationMs > 6 * 60 * 60 * 1000) {
                    setAvailabilityStatus('conflicts');
                    setAvailabilityMessage('⚠️ Inválido: O período de reserva não pode ser superior a 6 horas.');
                    return;
                }
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
    }, [area, startTime, endTime, condominiumId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        const minStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (start < minStartDate) {
            setError('As reservas precisam ser feitas com no mínimo 7 dias de antecedência.');
            setLoading(false);
            return;
        }

        const durationMs = end.getTime() - start.getTime();
        if (durationMs <= 0) {
            setError('A data/hora de fim deve ser posterior à data/hora de início.');
            setLoading(false);
            return;
        }
        if (durationMs > 6 * 60 * 60 * 1000) {
            setError('O período de reserva não pode ser superior a 6 horas.');
            setLoading(false);
            return;
        }

        try {
            const payload: CreateReservationPayload = { area, startTime, endTime, unitNumber };
            await CondominiumService.createReservation(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating reservation:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Falha ao criar a reserva. Tente novamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = area && startTime && endTime && unitNumber.trim();

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">Nova reserva</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                <div className="rules-callout">
                    <div className="rules-title">
                        <Info size={16} color="var(--color-primary)" />
                        <strong>Regras de reserva:</strong>
                    </div>
                    <ul className="rules-list">
                        <li>Mínimo de <strong>7 dias</strong> de antecedência.</li>
                        <li>Duração máxima de até <strong>6 horas</strong>.</li>
                    </ul>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-input-group">
                        <label className="modal-label">Área</label>
                        <CustomSelect
                            value={area}
                            onChange={(val) => setArea(val)}
                            placeholder="Selecione uma área..."
                            options={[
                                { value: 'Salão de Festas', label: 'Salão de Festas' },
                                { value: 'Churrasqueira', label: 'Churrasqueira' },
                                { value: 'Quadra Poliesportiva', label: 'Quadra Poliesportiva' },
                                { value: 'Piscina', label: 'Piscina' },
                                { value: 'Academia', label: 'Academia' },
                                { value: 'Espaço Gourmet', label: 'Espaço Gourmet' }
                            ]}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <label className="modal-label">Início da reserva</label>
                            <div className="date-input-wrapper">
                                <input 
                                    type="datetime-local" 
                                    required 
                                    value={startTime} 
                                    step="1" 
                                    onChange={(e) => setStartTime(e.target.value)} 
                                    className="modal-input date-input-field" 
                                />
                                <Calendar size={16} className="date-input-icon" />
                            </div>
                        </div>
                        
                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <label className="modal-label">Fim da reserva</label>
                            <div className="date-input-wrapper">
                                <input 
                                    type="datetime-local" 
                                    required 
                                    value={endTime} 
                                    step="1" 
                                    onChange={(e) => setEndTime(e.target.value)} 
                                    className="modal-input date-input-field" 
                                />
                                <Calendar size={16} className="date-input-icon" />
                            </div>
                        </div>
                    </div>

                    {availabilityMessage && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
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

                    <div className="modal-input-group">
                        <label className="modal-label">Unidade solicitante</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Informe o número da sua unidade" 
                            value={unitNumber} 
                            onChange={(e) => setUnitNumber(e.target.value)} 
                            className="modal-input" 
                        />
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="secondary-btn" 
                            style={{ height: '42px', borderRadius: '12px' }} 
                            disabled={loading || checkingAvailability}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="primary-btn" 
                            style={{ height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} 
                            disabled={loading || checkingAvailability || !isFormValid || availabilityStatus === 'conflicts'}
                        >
                            <Check size={16} />
                            {loading ? 'Salvando...' : 'Confirmar reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
