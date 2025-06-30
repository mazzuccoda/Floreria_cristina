// Sistema de notificaciones
const notifications = {
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Agregar animación de entrada
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },
    
    types: {
        success: '#4c9a58',
        error: '#ff4444',
        info: '#4a90e2',
        warning: '#f8bb56'
    }
};

// Estilos para las notificaciones
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .success { background-color: #4c9a58; }
    .error { background-color: #ff4444; }
    .info { background-color: #4a90e2; }
    .warning { background-color: #f8bb56; }
`;
document.head.appendChild(style);

// Exportar la función para usarla en otros archivos
window.showNotification = notifications.showNotification;
