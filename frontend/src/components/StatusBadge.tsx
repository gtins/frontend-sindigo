import React from 'react';
import '../styles/dashboard.css';

interface StatusBadgeProps {
    count?: number;
    text?: string;
    status?: 'healthy' | 'attention' | 'warning' | 'gray' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ count, text, status = 'healthy' }) => {
    let colorClass = 'status-green';

    if (status === 'attention') {
        colorClass = 'status-orange';
    } else if (status === 'warning') {
        colorClass = 'status-red';
    } else if (status === 'gray') {
        colorClass = 'status-gray';
    }

    const display = text ? text : (count === 1 ? '1 chamado aberto' : `${count || 0} chamados abertos`);
    const finalClass = `status-badge ${colorClass}`;

    return (
        <span className={finalClass}>
            {display}
        </span>
    );
};

