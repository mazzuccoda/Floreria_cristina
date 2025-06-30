// Configuración global del sitio
const CONFIG = {
    // Configuración de descuentos
    discounts: {
        ramos: {
            minQuantity: 3,
            discountPercentage: 10
        },
        plantas: {
            minQuantity: 5,
            discountPercentage: 15
        }
    },
    
    // Configuración de puntos y recompensas
    rewards: {
        pointsPerDollar: 10,
        rewardThreshold: 1000,
        rewardValue: 100
    },
    
    // Configuración de envío
    delivery: {
        baseCost: 150,
        freeDeliveryThreshold: 1000,
        deliveryTime: {
            standard: '24-48 horas',
            express: '12 horas'
        }
    },
    
    // Configuración de filtros
    filters: {
        priceRanges: [
            { min: 0, max: 500, label: 'Hasta $500' },
            { min: 500, max: 1000, label: '$500 - $1000' },
            { min: 1000, max: 2000, label: '$1000 - $2000' },
            { min: 2000, max: 10000, label: 'Más de $2000' }
        ],
        sizes: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
        colors: ['Rosa', 'Rojo', 'Blanco', 'Amarillo', 'Morado', 'Azul']
    },
    
    // Configuración de suscripciones
    subscriptions: {
        weekly: {
            price: 1500,
            description: 'Una entrega semanal de flores frescas'
        },
        monthly: {
            price: 5000,
            description: 'Una entrega mensual de flores frescas'
        }
    }
};

// Exportar la configuración
export default CONFIG;
