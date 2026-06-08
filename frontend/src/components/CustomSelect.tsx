import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectOption<T> {
    value: T;
    label: string;
}

interface CustomSelectProps<T> {
    value: T;
    onChange: (value: T) => void;
    options: CustomSelectOption<T>[];
    placeholder?: string;
    disabled?: boolean;
}

export const CustomSelect = <T extends string | number>({
    value,
    onChange,
    options,
    placeholder = 'Selecione...',
    disabled = false
}: CustomSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="custom-select-container" 
            style={{ position: 'relative', width: '100%', zIndex: isOpen ? 100 : 1 }}
        >
            <button
                type="button"
                className={`modal-select-trigger ${isOpen ? 'active' : ''}`}
                onClick={handleToggle}
                disabled={disabled}
                style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
                <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-light)'
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className="custom-select-arrow-svg"
                    style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s ease', 
                        flexShrink: 0,
                        color: 'var(--text-light)'
                    }} 
                />
            </button>

            {isOpen && (
                <div className="modal-select-dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`modal-select-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
