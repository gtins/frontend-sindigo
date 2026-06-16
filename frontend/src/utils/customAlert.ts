const customAlert = (message: string) => {
    // 1. Ensure container exists
    let container = document.getElementById('custom-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'custom-toast-container';
        document.body.appendChild(container);
    }

    // 2. Inject CSS styles if not already injected
    if (!document.getElementById('custom-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-toast-styles';
        style.textContent = `
            #custom-toast-container {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
                width: 100%;
                max-width: 480px;
                align-items: center;
            }
            .custom-toast {
                background: #ffffff;
                border: 1px solid #bbf7d0;
                border-radius: 14px;
                padding: 12px 20px;
                box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.08), 0 4px 12px -2px rgba(16, 185, 129, 0.03);
                display: flex;
                align-items: center;
                gap: 12px;
                pointer-events: auto;
                animation: slideDownCustom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                width: max-content;
                max-width: min(480px, 90vw);
                box-sizing: border-box;
            }
            .custom-toast.error-toast {
                border-color: #fecaca;
                box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.08), 0 4px 12px -2px rgba(239, 68, 68, 0.03);
            }
            .custom-toast span {
                font-size: 14px;
                font-weight: 500;
                color: #0f172a;
                flex: 1;
                word-break: break-word;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }
            .custom-toast-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #9ca3af;
                padding: 4px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                margin-left: 8px;
                flex-shrink: 0;
            }
            .custom-toast-close:hover {
                background-color: #f1f5f9;
                color: #4b5563;
            }
            /* Dark mode compatibility */
            .dark #custom-toast-container .custom-toast {
                background: #111827 !important;
                border-color: rgba(16, 185, 129, 0.3) !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 12px -2px rgba(0, 0, 0, 0.2) !important;
            }
            .dark #custom-toast-container .custom-toast.error-toast {
                border-color: rgba(239, 68, 68, 0.3) !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 12px -2px rgba(0, 0, 0, 0.2) !important;
            }
            .dark #custom-toast-container .custom-toast span {
                color: #f8fafc !important;
            }
            .dark #custom-toast-container .custom-toast-close:hover {
                background-color: #172033 !important;
                color: #f8fafc !important;
            }
            @keyframes slideDownCustom {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            .custom-toast.fade-out {
                opacity: 0;
                transform: translateY(-10px) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Determine if message is success or error
    const msgLower = message.toLowerCase();
    const isSuccess = msgLower.includes('sucesso') || 
                      msgLower.includes('salvo') || 
                      msgLower.includes('concluido') || 
                      msgLower.includes('concluído') || 
                      msgLower.includes('enviado') || 
                      msgLower.includes('vinculado') || 
                      msgLower.includes('alterado');

    const toast = document.createElement('div');
    toast.className = `custom-toast ${isSuccess ? 'success-toast' : 'error-toast'}`;

    // 4. Set icons
    const successIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    `;
    const errorIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    `;
    const closeIcon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;

    toast.innerHTML = `
        ${isSuccess ? successIcon : errorIcon}
        <span>${message}</span>
        <button class="custom-toast-close">
            ${closeIcon}
        </button>
    `;

    // 5. Setup dismiss functions
    const dismiss = () => {
        if (toast.classList.contains('fade-out')) return;
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    };

    // Auto-dismiss after 4 seconds
    const timeoutId = setTimeout(dismiss, 4000);

    // Click close button to dismiss
    const closeBtn = toast.querySelector('.custom-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearTimeout(timeoutId);
            dismiss();
        });
    }

    container.appendChild(toast);
};

// Override window.alert
if (typeof window !== 'undefined') {
    (window as any).alert = customAlert;
}

export default customAlert;
