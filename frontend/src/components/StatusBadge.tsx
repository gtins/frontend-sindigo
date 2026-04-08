import React from 'react';
import '../styles/dashboard.css';

interface StatusBadgeProps {
    count?: number;
    text?: string;
    status?: 'healthy' | 'attention' | 'warning';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ count, text, status = 'healthy' }) => {
    // Determine color class based on status or count if not explicitly provided
    let colorClass = 'status-green';

    if (status === 'attention' || (count && count > 0 && count < 10)) {
        colorClass = 'status-orange';
    } else if (status === 'warning' || (count && count >= 10)) {
        colorClass = 'status-orange'; // Image mostly uses orange for attention, let's stick to that or custom 'red' for warning
    }

    // Override specific logic to match image
    // 0 -> Green
    // > 0 -> Orange
    // "Inadimplências" -> Orange
    // "Inspeções" -> Yellow/Orange

    if (count === 0) colorClass = 'status-green';

    // Custom tweaks for "Inadimplências" (Building 5 - Orange in image)
    // Custom for "Inspeções em breve" (Building 3 - Yellow/Orange in image)

    const display = text ? text : `${count} chamados abertos`;

    // Explicit 'warning' status from data might map to a specific color
    // In the image, Building 2 has 14 tickets (Orange), Building 5 has Inadimplências (Orange), Building 3 Inspeções (Yellowish-Orange).
    // Green is only for 0 tickets.

    const finalClass = `status-badge ${colorClass}`;

    return (
        <span className={finalClass}>
            {display}
        </span>
    );
};
