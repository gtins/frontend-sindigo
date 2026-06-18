import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateCondominiumPayload } from '../types';

interface CreateCondominiumModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateCondominiumModal: React.FC<CreateCondominiumModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [unidades, setUnidades] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Touch states for inline validation
    const [nameTouched, setNameTouched] = useState(false);
    const [addressTouched, setAddressTouched] = useState(false);
    const [unidadesTouched, setUnidadesTouched] = useState(false);

    // Validation logic
    const nameError = nameTouched && !name.trim() ? 'Informe o nome do condomínio.' : '';
    const addressError = addressTouched && !address.trim() ? 'Informe o endereço.' : '';
    const unidadesError = unidadesTouched && (!unidades || Number(unidades) <= 0) ? 'A quantidade de unidades deve ser maior que zero.' : '';

    const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, ''); // positive integers only
        setUnidades(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Mark all fields as touched to trigger validation messages
        setNameTouched(true);
        setAddressTouched(true);
        setUnidadesTouched(true);

        const isNameValid = name.trim().length > 0;
        const isAddressValid = address.trim().length > 0;
        const isUnidadesValid = unidades.trim().length > 0 && Number(unidades) > 0;

        if (!isNameValid || !isAddressValid || !isUnidadesValid) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: CreateCondominiumPayload = { name, address, unidades: Number(unidades) };
            await CondominiumService.create(payload);
            onSuccess(); // Triggers a re-fetch and closes modal
        } catch (err: any) {
            console.error('Error creating condominium:', err);
            setError('Falha ao criar o condomínio. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle} className="modal-overlay-animate">
            <style>{modalStyles}</style>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <div style={headerTextContainerStyle}>
                        <div style={titleContainerStyle}>
                            <div style={iconWrapperStyle}>
                                <Building2 size={18} color="var(--color-accent)" strokeWidth={2.5} />
                            </div>
                            <h2 style={titleStyle}>Adicionar prédio</h2>
                        </div>
                        <p style={subtitleStyle}>
                            Cadastre um novo condomínio para gerenciar unidades, chamados e atividades.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={closeBtnStyle} 
                        className="close-btn-hover"
                        aria-label="Fechar modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle} noValidate>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Nome do Condomínio</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Torre Trentinni"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            onBlur={() => setNameTouched(true)}
                            className="modal-input"
                            style={getInputStyle(!!nameError)}
                        />
                        {nameError && <span style={validationErrorStyle}>{nameError}</span>}
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Endereço</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Rua Bento Torquato da Rocha, 135"
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            onBlur={() => setAddressTouched(true)}
                            className="modal-input"
                            style={getInputStyle(!!addressError)}
                        />
                        {addressError && <span style={validationErrorStyle}>{addressError}</span>}
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Quantidade de Unidades</label>
                        <span style={helperTextStyle}>Informe o total de unidades do condomínio.</span>
                        <input 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Ex: 10"
                            value={unidades} 
                            onChange={handleUnitsChange} 
                            onBlur={() => setUnidadesTouched(true)}
                            className="modal-input"
                            style={getInputStyle(!!unidadesError)}
                        />
                        {unidadesError && <span style={validationErrorStyle}>{unidadesError}</span>}
                    </div>
                    
                    <div style={footerStyle}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            style={cancelBtnStyle} 
                            className="secondary-btn-hover"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            style={getSubmitButtonStyle(loading)} 
                            className="primary-btn-hover"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Cadastrar prédio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const modalStyles = `
@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
@keyframes overlayFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
.modal-overlay-animate {
    animation: overlayFadeIn 0.2s ease-out;
}
.close-btn-hover {
    transition: all 0.2s;
}
.close-btn-hover:hover {
    background-color: var(--bg-hover) !important;
    color: var(--text-main) !important;
}
.modal-input {
    transition: all 0.2s;
}
.modal-input:focus {
    border-color: var(--color-accent) !important;
    box-shadow: 0 0 0 3px var(--color-accent-light) !important;
}
.primary-btn-hover {
    transition: all 0.2s;
}
.primary-btn-hover:hover:not(:disabled) {
    background-color: var(--color-accent-hover) !important;
}
.secondary-btn-hover {
    transition: all 0.2s;
}
.secondary-btn-hover:hover:not(:disabled) {
    background-color: var(--bg-hover) !important;
    color: var(--text-main) !important;
    border-color: var(--text-light) !important;
}
`;

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    padding: '28px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '12px'
};

const headerTextContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
};

const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-accent-light)',
    flexShrink: 0
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-main)'
};

const subtitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-light)',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, color 0.2s',
    flexShrink: 0
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)'
};

const helperTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-light)',
    marginTop: '-2px',
    marginBottom: '2px'
};

const validationErrorStyle: React.CSSProperties = {
    color: 'var(--status-red, #ef4444)',
    fontSize: '0.75rem',
    marginTop: '2px',
    fontWeight: 500
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};

const getInputStyle = (hasError: boolean): React.CSSProperties => ({
    ...inputStyle,
    borderColor: hasError ? 'var(--status-red, #ef4444)' : 'var(--border-color)',
    boxShadow: hasError ? '0 0 0 1px var(--status-red, #ef4444)' : 'none'
});

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-accent)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const getSubmitButtonStyle = (disabled: boolean): React.CSSProperties => {
    if (disabled) {
        return {
            ...submitBtnStyle,
            backgroundColor: 'var(--bg-btn-neutral)',
            color: 'var(--text-light)',
            border: '1px solid var(--border-color)',
            cursor: 'not-allowed'
        };
    }
    return submitBtnStyle;
};

const errorStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--status-red-bg, #fee2e2)',
    color: 'var(--status-red, #b91c1c)',
    fontSize: '0.875rem',
    marginBottom: '16px',
    border: '1px solid var(--status-red-border, #fee2e2)'
};
