// script.js - Florería Cristina
// Configuración global
const CONFIG = {
    discounts: {
        minQuantity: 3,
        percentage: 10,
        combos: {
            'Ramos': {
                '3': 10,
                '5': 15,
                '10': 20
            },
            'Plantas': {
                '2': 5,
                '4': 10,
                '6': 15
            }
        }
    },
    rewards: {
        pointsPerDollar: 1,
        pointsToDiscount: 100
    },
    delivery: {
        baseCost: 150,
        freeDeliveryThreshold: 1000
    },
    filters: {
        minPrice: 0,
        maxPrice: 5000,
        categories: ['Ramos', 'Plantas', 'Novias', 'Iglesias', 'Fiestas']
    },
    subscriptions: {
        weekly: {
            price: 800,
            description: 'Ramo semanal de flores frescas'
        },
        monthly: {
            price: 3000,
            description: 'Ramo mensual de flores frescas'
        }
    }
};

// Variables globales
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];
let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
let wishList = JSON.parse(localStorage.getItem('wishList')) || [];
let savedCarts = JSON.parse(localStorage.getItem('savedCarts')) || {};

// Datos estáticos de productos
const staticProducts = [
    {
        id: "1",
        categoria: "Ramos",
        tipo: "Clásico",
        descripcion: "Ramo de rosas rojas",
        precio: 1500,
        imgUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486ec95?w=500&auto=format&fit=crop&q=60",
        descuento: null
    },
    {
        id: "2",
        categoria: "Plantas",
        tipo: "Interior",
        descripcion: "Planta de suculenta",
        precio: 800,
        imgUrl: "https://images.unsplash.com/photo-1485955900956-50d97f387d27?w=500&auto=format&fit=crop&q=60",
        descuento: 10
    },
    {
        id: "3",
        categoria: "Novias",
        tipo: "Bouquet",
        descripcion: "Bouquet de novia con rosas y baby's breath",
        precio: 2500,
        imgUrl: "https://images.unsplash.com/photo-1526404866585-3a9e5c37ebf0?w=500&auto=format&fit=crop&q=60",
        descuento: null
    },
    {
        id: "4",
        categoria: "Iglesias",
        tipo: "Arreglo",
        descripcion: "Arreglo para altar con lirios y orquídeas",
        precio: 3500,
        imgUrl: "https://images.unsplash.com/photo-1511895426327-d643d9c01e4f?w=500&auto=format&fit=crop&q=60",
        descuento: 15
    },
    {
        id: "5",
        categoria: "Fiestas",
        tipo: "Decoración",
        descripcion: "Centro de mesa con flores de temporada",
        precio: 1800,
        imgUrl: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&auto=format&fit=crop&q=60",
        descuento: null
    }
];

// Función para cargar los productos
function loadProducts() {
    return new Promise((resolve, reject) => {
        try {
            // Usar los datos estáticos de productos
            allProducts = [
                {
                    id: "1",
                    categoria: "Ramos",
                    tipo: "Clásico",
                    descripcion: "Ramo de rosas rojas",
                    precio: 1500,
                    imgUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486ec95?w=500&auto=format&fit=crop&q=60",
                    descuento: null
                },
                {
                    id: "2",
                    categoria: "Plantas",
                    tipo: "Interior",
                    descripcion: "Planta de suculenta",
                    precio: 800,
                    imgUrl: "https://images.unsplash.com/photo-1485955900956-50d97f387d27?w=500&auto=format&fit=crop&q=60",
                    descuento: 10
                },
                {
                    id: "3",
                    categoria: "Novias",
                    tipo: "Bouquet",
                    descripcion: "Bouquet de novia con rosas y baby's breath",
                    precio: 2500,
                    imgUrl: "https://images.unsplash.com/photo-1526404866585-3a9e5c37ebf0?w=500&auto=format&fit=crop&q=60",
                    descuento: null
                },
                {
                    id: "4",
                    categoria: "Iglesias",
                    tipo: "Arreglo",
                    descripcion: "Arreglo para altar con lirios y orquídeas",
                    precio: 3500,
                    imgUrl: "https://images.unsplash.com/photo-1511895426327-d643d9c01e4f?w=500&auto=format&fit=crop&q=60",
                    descuento: 15
                },
                {
                    id: "5",
                    categoria: "Fiestas",
                    tipo: "Decoración",
                    descripcion: "Centro de mesa con flores de temporada",
                    precio: 1800,
                    imgUrl: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&auto=format&fit=crop&q=60",
                    descuento: null
                }
            ];

            // Renderizar los productos
            renderProducts(allProducts);
            
            // Inicializar los filtros
            initializeFilters();
            
            // Actualizar el ícono del carrito
            updateCartIcon();
            
            // Mostrar notificación de éxito
            showNotification('Productos cargados correctamente', 'success');
            
            // Resolver la promesa
            resolve(allProducts);
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            showNotification('Error al cargar los productos', 'error');
            reject(error);
        }
    });
}

// Función para renderizar los productos en la página
function renderProducts(products) {
    try {
        const container = document.getElementById('catalogo-container');
        if (!container) {
            throw new Error('No se encontró el contenedor de productos');
        }

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos que coincidan con tu búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imgUrl}" alt="${product.descripcion}" onerror="this.src='https://via.placeholder.com/300x300?text=Imagen+no+disponible'">
                    ${product.descuento ? `<span class="discount-badge">-${product.descuento}%</span>` : ''}
                </div>
                <div class="product-details">
                    <h3>${product.descripcion}</h3>
                    <p class="product-category">${product.categoria} - ${product.tipo}</p>
                    <div class="product-price">
                        ${product.descuento ? 
                            `<span class="original-price">$${(product.precio * (1 + product.descuento/100)).toFixed(2)}</span>` : 
                            ''
                        }
                        <span class="final-price">$${product.precio.toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button onclick="addToCart('${product.id}')" class="add-to-cart-btn">
                            <i class="fas fa-cart-plus"></i> Añadir al carrito
                        </button>
                        <button onclick="addToWishlist('${product.id}')" class="wishlist-btn">
                            <i class="far fa-heart"></i>
                        </button>
                        <button onclick="consultarProducto(${JSON.stringify(product).replace(/'/g, '&#39;')})" class="consult-btn">
                            <i class="fas fa-comment"></i> Consultar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error al renderizar productos:', error);
        const container = document.getElementById('catalogo-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los productos: ${error.message}</p>
                    <button onclick="window.location.reload()" class="retry-btn">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Función para inicializar los filtros de categorías
function initializeFilters() {
    try {
        const filterContainer = document.querySelector('.category-filters');
        if (!filterContainer) {
            console.warn('No se encontró el contenedor de filtros');
            return;
        }

        // Obtener categorías únicas de los productos
        const categories = ['Todos', ...new Set(allProducts.map(p => p.categoria))];
        
        // Crear botones de filtro
        const filterButtons = categories.map(category => {
            const isActive = category === 'Todos' ? 'active' : '';
            return `
                <button 
                    class="filter-btn ${isActive}" 
                    onclick="filterProducts('${category}')"
                    data-category="${category}">
                    ${category}
                </button>
            `;
        }).join('');
        
        filterContainer.innerHTML = filterButtons;
        
    } catch (error) {
        console.error('Error al inicializar los filtros:', error);
        showNotification('Error al cargar los filtros', 'error');
    }
}

// Función para filtrar productos por categoría
function filterProducts(category) {
    try {
        let filteredProducts = allProducts;
        
        // Aplicar filtro de categoría
        if (category && category !== 'Todos') {
            filteredProducts = allProducts.filter(product => product.categoria === category);
        }
        
        // Renderizar productos filtrados
        renderProducts(filteredProducts);
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            if (btnCategory === category || (!category && btn.textContent.trim() === 'Todos')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
    } catch (error) {
        console.error('Error al filtrar productos:', error);
        showNotification('Error al filtrar los productos', 'error');
    }
}

// Función para actualizar el ícono del carrito
function updateCartIcon() {
    try {
        const cartCountElement = document.getElementById('cart-count');
        if (!cartCountElement) {
            console.warn('No se encontró el elemento del contador del carrito');
            return;
        }
        
        // Calcular el total de ítems en el carrito
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // Actualizar el contador
        cartCountElement.textContent = totalItems;
        
        // Guardar el carrito en localStorage
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
    } catch (error) {
        console.error('Error al actualizar el ícono del carrito:', error);
    }
}

// Función para agregar un producto al carrito
function addToCart(productId) {
    try {
        // Buscar el producto en la lista de productos
        const product = allProducts.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        
        // Verificar si el producto ya está en el carrito
        const existingItem = cartItems.find(item => item.id === productId);
        
        if (existingItem) {
            // Incrementar la cantidad si ya existe
            existingItem.quantity += 1;
        } else {
            // Agregar nuevo ítem al carrito
            cartItems.push({
                id: product.id,
                name: product.descripcion,
                price: product.precio,
                quantity: 1,
                image: product.imgUrl,
                category: product.categoria
            });
        }
        
        // Actualizar el carrito en la interfaz
        updateCartIcon();
        
        // Mostrar notificación de éxito
        showNotification(`${product.descripcion} agregado al carrito`, 'success');
        
        // Actualizar el modal del carrito si está abierto
        if (document.getElementById('cart-modal')?.style.display === 'block') {
            updateCartModal();
        }
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        showNotification('Error al agregar el producto al carrito', 'error');
    }
}

// Función para mostrar/ocultar el modal del carrito
function toggleCartModal() {
    try {
        const modal = document.getElementById('cart-modal');
        if (!modal) {
            console.warn('No se encontró el modal del carrito');
            return;
        }
        
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
            updateCartModal(); // Actualizar el contenido del carrito
        }
    } catch (error) {
        console.error('Error al alternar el modal del carrito:', error);
        showNotification('Error al abrir el carrito', 'error');
    }
}

// Función para actualizar el contenido del modal del carrito
function updateCartModal() {
    try {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        
        if (!cartItemsContainer || !cartSummary) {
            console.warn('No se encontraron los elementos del carrito');
            return;
        }
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            cartSummary.innerHTML = '';
            return;
        }
        
        // Renderizar ítems del carrito
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100?text=Imagen+no+disponible'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} c/u</p>
                    <div class="quantity-controls">
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    <button onclick="removeFromCart('${item.id}')" class="remove-item-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Calcular totales
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = calculateDiscount(cartItems);
        const total = subtotal - discount;
        
        // Actualizar resumen
        cartSummary.innerHTML = `
            <div class="cart-summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
                <div class="cart-summary-row discount">
                    <span>Descuento:</span>
                    <span>-$${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="cart-summary-row total">
                <strong>Total:</strong>
                <strong>$${total.toFixed(2)}</strong>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        showNotification('Error al cargar el carrito', 'error');
    }
}

// Función para actualizar la cantidad de un ítem en el carrito
function updateCartItemQuantity(productId, newQuantity) {
    try {
        const item = cartItems.find(item => item.id === productId);
        if (!item) return;
        
        if (newQuantity <= 0) {
            // Eliminar el ítem si la cantidad es 0 o menor
            cartItems = cartItems.filter(item => item.id !== productId);
        } else {
            // Actualizar la cantidad
            item.quantity = newQuantity;
        }
        
        // Actualizar la interfaz
        updateCartIcon();
        updateCartModal();
        
    } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
        showNotification('Error al actualizar la cantidad', 'error');
    }
}

// Función para eliminar un ítem del carrito
function removeFromCart(productId) {
    try {
        cartItems = cartItems.filter(item => item.id !== productId);
        updateCartIcon();
        updateCartModal();
        showNotification('Producto eliminado del carrito', 'success');
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        showNotification('Error al eliminar el producto', 'error');
    }
}

// Función para calcular descuentos
function calculateDiscount(items) {
    // Implementar lógica de descuentos según la configuración
    return 0; // Por ahora sin descuentos
}

// Función para agregar/eliminar de la lista de deseos
function addToWishlist(productId) {
    try {
        // Buscar el producto en la lista de productos
        const product = allProducts.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        
        // Verificar si el producto ya está en la lista de deseos
        const existingIndex = wishList.findIndex(item => item.id === productId);
        
        if (existingIndex >= 0) {
            // Eliminar de la lista de deseos si ya está presente
            wishList.splice(existingIndex, 1);
            showNotification('Eliminado de la lista de deseos', 'info');
        } else {
            // Agregar a la lista de deseos
            wishList.push({
                id: product.id,
                name: product.descripcion,
                price: product.precio,
                image: product.imgUrl,
                category: product.categoria
            });
            showNotification('Agregado a la lista de deseos', 'success');
        }
        
        // Actualizar el almacenamiento local
        localStorage.setItem('wishList', JSON.stringify(wishList));
        
        // Actualizar el ícono de la lista de deseos si existe
        updateWishlistIcon();
        
        // Actualizar el modal de la lista de deseos si está abierto
        if (document.getElementById('wishlist-modal')?.style.display === 'block') {
            updateWishlistModal();
        }
        
    } catch (error) {
        console.error('Error al actualizar la lista de deseos:', error);
        showNotification('Error al actualizar la lista de deseos', 'error');
    }
}

// Función para actualizar el ícono de la lista de deseos
function updateWishlistIcon() {
    try {
        const wishlistCountElement = document.getElementById('wishlist-count');
        if (wishlistCountElement) {
            wishlistCountElement.textContent = wishList.length;
        }
    } catch (error) {
        console.error('Error al actualizar el ícono de la lista de deseos:', error);
    }
}

// Función para actualizar el modal de la lista de deseos
function updateWishlistModal() {
    try {
        const wishlistContainer = document.getElementById('wishlist-items');
        if (!wishlistContainer) return;
        
        if (wishList.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <i class="far fa-heart"></i>
                    <p>Tu lista de deseos está vacía</p>
                </div>
            `;
            return;
        }
        
        wishlistContainer.innerHTML = wishList.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80?text=Imagen+no+disponible'">
                <div class="wishlist-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                    <div class="wishlist-item-actions">
                        <button onclick="addToCart('${item.id}')" class="add-to-cart-btn">
                            <i class="fas fa-cart-plus"></i> Añadir al carrito
                        </button>
                        <button onclick="addToWishlist('${item.id}')" class="remove-wishlist-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error al actualizar la lista de deseos:', error);
        showNotification('Error al cargar la lista de deseos', 'error');
    }
}

// Función para mostrar/ocultar el modal de la lista de deseos
function toggleWishlistModal() {
    try {
        const modal = document.getElementById('wishlist-modal');
        if (!modal) return;
        
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
            updateWishlistModal();
        }
    } catch (error) {
        console.error('Error al alternar el modal de la lista de deseos:', error);
        showNotification('Error al abrir la lista de deseos', 'error');
    }
}

// Función para vaciar el carrito de compras
function clearCart() {
    try {
        if (cartItems.length === 0) {
            showNotification('El carrito ya está vacío', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            cartItems = [];
            localStorage.setItem('cart', JSON.stringify(cartItems));
            updateCartIcon();
            updateCartModal();
            showNotification('Carrito vaciado correctamente', 'success');
        }
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        showNotification('Error al vaciar el carrito', 'error');
    }
}

// Función para manejar el proceso de finalización de compra
function checkoutCart() {
    try {
        if (cartItems.length === 0) {
            showNotification('Tu carrito está vacío', 'warning');
            return;
        }
        
        // Crear mensaje de WhatsApp con el resumen del pedido
        const telefono = '5491155555555'; // Reemplazar con el número de teléfono real
        let mensaje = '¡Hola! Me gustaría realizar el siguiente pedido:%0A%0A';
        
        // Agregar productos al mensaje
        cartItems.forEach(item => {
            mensaje += `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}%0A`;
        });
        
        // Calcular total
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = calculateDiscount(cartItems);
        const total = subtotal - discount;
        
        mensaje += `%0A*Subtotal:* $${subtotal.toFixed(2)}%0A`;
        
        if (discount > 0) {
            mensaje += `*Descuento:* -$${discount.toFixed(2)}%0A`;
        }
        
        mensaje += `*Total:* $${total.toFixed(2)}%0A%0A`;
        mensaje += 'Por favor, indíqueme cómo proceder con el pago y el envío.';
        
        // Abrir WhatsApp con el mensaje
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
        
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        showNotification('Error al procesar el pedido', 'error');
    }
}

// Función para manejar la consulta de un producto
function consultarProducto(producto) {
    try {
        if (!producto) {
            throw new Error('Información del producto no disponible');
        }
        
        // Crear mensaje de WhatsApp con los detalles del producto
        const telefono = '5491155555555'; // Reemplazar con el número de teléfono real
        const mensaje = `Hola, estoy interesado en el siguiente producto:%0A%0A` +
                      `*${producto.descripcion}*%0A` +
                      `Categoría: ${producto.categoria}%0A` +
                      `Tipo: ${producto.tipo}%0A` +
                      `Precio: $${producto.precio.toFixed(2)}%0A%0A` +
                      `¿Podrías darme más información?`;
        
        // Abrir WhatsApp con el mensaje
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
        
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        showNotification('Error al realizar la consulta', 'error');
    }
}

// Función para vaciar la lista de deseos
function clearWishlist() {
    try {
        if (wishList.length === 0) {
            showNotification('La lista de deseos ya está vacía', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que deseas vaciar tu lista de deseos?')) {
            wishList = [];
            localStorage.setItem('wishList', JSON.stringify(wishList));
            updateWishlistIcon();
            updateWishlistModal();
            showNotification('Lista de deseos vaciada', 'success');
        }
    } catch (error) {
        console.error('Error al vaciar la lista de deseos:', error);
        showNotification('Error al vaciar la lista de deseos', 'error');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    try {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Configurar el ícono según el tipo de notificación
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        else if (type === 'error') icon = 'exclamation-circle';
        else if (type === 'warning') icon = 'exclamation-triangle';
        
        // Establecer el contenido de la notificación
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Agregar la notificación al cuerpo del documento
        document.body.appendChild(notification);
        
        // Mostrar la notificación con animación
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Eliminar la notificación después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
    } catch (error) {
        console.error('Error al mostrar notificación:', error);
        // Fallback a alert si hay un error
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Hacer las funciones accesibles globalmente
window.showNotification = showNotification;
window.toggleCartModal = toggleCartModal;
window.updateCartModal = updateCartModal;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.updateCartIcon = updateCartIcon;
window.addToCart = addToCart;
window.initializeFilters = initializeFilters;
window.filterProducts = filterProducts;
window.renderProducts = renderProducts;
window.loadProducts = loadProducts;





// === FUNCIONES DE RENDERIZADO ===
// Función para renderizar los productos en la página
function renderProducts(products) {
    try {
        const container = document.getElementById('catalogo-container');
        if (!container) {
            throw new Error('No se encontró el contenedor de productos');
        }

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos que coincidan con tu búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imgUrl}" alt="${product.descripcion}" onerror="this.src='https://via.placeholder.com/300x300?text=Imagen+no+disponible'">
                    ${product.descuento ? `<span class="discount-badge">-${product.descuento}%</span>` : ''}
                </div>
                <div class="product-details">
                    <h3>${product.descripcion}</h3>
                    <p class="product-category">${product.categoria} - ${product.tipo}</p>
                    <div class="product-price">
                        ${product.descuento ? 
                            `<span class="original-price">$${(product.precio * (1 + product.descuento/100)).toFixed(2)}</span>` : 
                            ''
                        }
                        <span class="final-price">$${product.precio.toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                            <i class="fas fa-cart-plus"></i> Añadir al carrito
                        </button>
                        <button onclick="addToWishlist(${product.id})" class="wishlist-btn">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error al renderizar productos:', error);
        const container = document.getElementById('catalogo-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los productos: ${error.message}</p>
                    <button onclick="window.location.reload()" class="retry-btn">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// === FUNCIONES DE FILTRADO ===
// La función initializeFilters está definida más adelante en el archivo

// === FUNCIONES DEL CARRITO ===
// Función para agregar un producto al carrito
function addToCart(productId) {
    try {
        // Buscar el producto por su ID
        const product = staticProducts.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Verificar si el producto ya está en el carrito
        const existingItem = cartItems.find(item => item.id === productId);
        
        if (existingItem) {
            // Incrementar la cantidad si ya existe
            existingItem.quantity += 1;
        } else {
            // Agregar nuevo ítem al carrito
            cartItems.push({
                id: product.id,
                nombre: product.descripcion,
                precio: product.precio,
                imgUrl: product.imgUrl,
                quantity: 1
            });
        }

        // Actualizar el almacenamiento local
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        // Actualizar el ícono del carrito
        updateCartIcon();
        
        // Mostrar notificación de éxito
        showNotification('Producto agregado al carrito', 'success');
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        showNotification('Error al agregar el producto al carrito', 'error');
    }
}

// Función para manejar la consulta de un producto
function consultarProducto(product) {
    try {
        // Mostrar un diálogo de confirmación
        const confirmarConsulta = confirm(`¿Deseas más información sobre ${product.descripcion}?\n\nPrecio: $${product.precio.toFixed(2)}\nCategoría: ${product.categoria}\n\nTe contactaremos a la brevedad.`);
        
        if (confirmarConsulta) {
            // Aquí podrías implementar la lógica para enviar la consulta
            // Por ejemplo, abrir un formulario de contacto o enviar un correo
            showNotification('Hemos recibido tu consulta. Te contactaremos pronto.', 'success');
            
            // Opcional: Registrar la consulta en el almacenamiento local
            const consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
            consultas.push({
                productoId: product.id,
                productoNombre: product.descripcion,
                fecha: new Date().toISOString()
            });
            localStorage.setItem('consultas', JSON.stringify(consultas));
        }
    } catch (error) {
        console.error('Error al procesar la consulta:', error);
        showNotification('Error al procesar tu consulta. Por favor, inténtalo de nuevo.', 'error');
    }
}

// Función para agregar un producto a la lista de deseos
function addToWishlist(productId) {
    try {
        // Buscar el producto por su ID
        const product = staticProducts.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Verificar si el producto ya está en la lista de deseos
        const existingItem = wishList.find(item => item.id === productId);
        
        if (existingItem) {
            // Si ya está en la lista, no hacer nada
            showNotification('Este producto ya está en tu lista de deseos', 'info');
            return;
        }

        // Agregar a la lista de deseos
        wishList.push({
            id: product.id,
            nombre: product.descripcion,
            precio: product.precio,
            imgUrl: product.imgUrl
        });

        // Actualizar el almacenamiento local
        localStorage.setItem('wishList', JSON.stringify(wishList));
        
        // Mostrar notificación de éxito
        showNotification('Producto agregado a tu lista de deseos', 'success');
        
    } catch (error) {
        console.error('Error al agregar a la lista de deseos:', error);
        showNotification('Error al agregar el producto a la lista de deseos', 'error');
    }
}

// Función para actualizar el ícono del carrito
function updateCartIcon() {
    try {
        const cartIcon = document.getElementById('cart-count');
        if (cartIcon) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartIcon.textContent = totalItems > 0 ? totalItems : '';
            cartIcon.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error al actualizar el ícono del carrito:', error);
    }
}

// === FUNCIONES DE CARGA DE DATOS ===
// Función para cargar productos
function loadProducts() {
    return new Promise((resolve, reject) => {
        try {
            // Inicializar el carrito
            cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            updateCartIcon();
            
            // Usar datos estáticos
            allProducts = staticProducts;
            
            // Renderizar productos
            renderProducts(allProducts);
            initializeFilters();
            
            // Mostrar mensaje de éxito
            showNotification('Productos cargados exitosamente', 'success');
            resolve();
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            
            // Mostrar error en la página
            const container = document.getElementById('catalogo-container');
            if (container) {
                container.innerHTML = `
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p class="error-message">Error al cargar los productos</p>
                        <p class="error-details">${error.message}</p>
                        <button onclick="window.location.reload()" class="retry-button">
                            <i class="fas fa-sync"></i> Intentar nuevamente
                        </button>
                    </div>
                `;
            }
            
            // Mostrar notificación
            showNotification('Error al cargar los productos. Por favor, inténtelo más tarde.', 'error');
            reject(error);
        }
    });
}





// Inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos al iniciar
    loadProducts().then(() => {
        // Inicializar filtros
        initializeFilters();
        
        // Actualizar íconos
        updateCartIcon();
        updateWishlistIcon();
    });
});

// Hacer las funciones accesibles globalmente
window.showNotification = showNotification;
window.toggleCartModal = toggleCartModal;
window.updateCartModal = updateCartModal;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.updateCartIcon = updateCartIcon;
window.addToCart = addToCart;
window.initializeFilters = initializeFilters;
window.filterProducts = filterProducts;
window.renderProducts = renderProducts;
window.loadProducts = loadProducts;
window.addToWishlist = addToWishlist;
window.updateWishlistIcon = updateWishlistIcon;
window.updateWishlistModal = updateWishlistModal;
window.toggleWishlistModal = toggleWishlistModal;
window.clearWishlist = clearWishlist;
window.consultarProducto = consultarProducto;
window.checkoutCart = checkoutCart;
window.clearCart = clearCart;
}
// Función para inicializar los filtros
function initializeFilters() {
    try {
        const filterContainer = document.querySelector('.category-filters');
        if (!filterContainer) return;

        // Obtener categorías únicas de los productos
        const categories = [...new Set(staticProducts.map(p => p.categoria))];
        
        // Crear botones de filtro
        const filterButtons = categories.map(category => 
            `<button onclick="filterProducts('${category}')" class="filter-btn">${category}</button>`
        ).join('');
        
        // Agregar botón de 'Todos' al principio
        filterContainer.innerHTML = `
            <button onclick="filterProducts('Todos')" class="filter-btn active">Todos</button>
            ${filterButtons}
        `;
        
    } catch (error) {
        console.error('Error al inicializar filtros:', error);
    }
}

// Función para filtrar productos por categoría
function filterProducts(category) {
    try {
        let filteredProducts = category === 'Todos' 
            ? staticProducts 
            : staticProducts.filter(p => p.categoria === category);
        
        renderProducts(filteredProducts);
        
        // Actualizar clase activa en los botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === category || (category === 'Todos' && btn.textContent === 'Todos')) {
                btn.classList.add('active');
            }
        });
        
    } catch (error) {
        console.error('Error al filtrar productos:', error);
        showNotification('Error al filtrar productos', 'error');
    }
}
        
// Función para mostrar notificaciones

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  // Verificar si existe la función global de notificaciones
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // Si no existe, usar alert como fallback
    alert(message);
  }
}

// Función para añadir productos al carrito
function addToCart(product) {
  // Si el producto es de tipo "consultar" (Iglesias, Fiestas, Novias), ir directo a WhatsApp
  if (!['Ramos', 'Plantas'].includes(product.categoria)) {
    consultarProducto(product);
    return;
  }

  // Verificar si el producto está en la lista de deseos y moverlo al carrito
  const wishIndex = wishList.findIndex(item => item.id === product.id);
  if (wishIndex !== -1) {
    wishList.splice(wishIndex, 1);
    localStorage.setItem('wishList', JSON.stringify(wishList));
  }

  const existingProduct = cartItems.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cartItems.push({ 
      ...product, 
      name: product.descripcion, 
      price: parseFloat(product.precio), 
      image: product.imgUrl, 
      quantity: 1,
      dateAdded: new Date().toISOString(),
      discount: calculateDiscount(product)
    });
  }

  // Actualizar puntos del usuario
  updateUserPoints(product.price);
  
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartIcon();
  showNotification(`"${product.descripcion}" añadido al carrito.`, 'success');
  
  // Actualizar resumen del carrito
  updateCartSummary();
}

// Función para abrir WhatsApp para productos de consulta
function consultarProducto(product) {
  const mensaje = `Hola, quiero consultar sobre: ${product.descripcion} (${product.categoria}). ¿Me podrías dar más información?`;
  // Reemplaza con tu número de WhatsApp
  window.open(`https://wa.me/5493814778577?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// --- Funciones para el MODAL del carrito (usadas en catalogo.html) y la página carrito.html ---

// Función para inicializar el carrito al cargar la página
function loadCart() {
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartIcon(); // Asegura que el ícono del carrito se actualice al cargar cualquier página
}

// Llama a loadCart al inicio para cargar el carrito
loadCart();

// Funciones para manejar la apertura y cierre del modal del carrito
function toggleCartModal() {
  const modal = document.getElementById("cart-modal");
  if (modal) {
      modal.style.display = modal.style.display === "block" ? "none" : "block";
      if (modal.style.display === "block") {
          renderCart();
          updateCartSummary();
          updateWishList();
      }
  }
}

// Remover un item del carrito (por su índice en el array cartItems)
function removeItem(index) {
  cartItems.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart(); // Vuelve a renderizar el carrito después de eliminar
  updateCartIcon(); // Actualiza el contador del icono
}

// Actualizar cantidad de un item en el carrito
function updateQuantity(index, change) {
  const item = cartItems[index];
  item.quantity += change;
  if (item.quantity <= 0) {
    removeItem(index); // Si la cantidad llega a 0 o menos, eliminar el item
  } else {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCart(); // Vuelve a renderizar el carrito
  }
  updateCartIcon(); // Actualiza el contador del icono
}

// Renderizar los elementos del carrito en el modal/página de carrito
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total-price");
  const noProductsMessage = document.querySelector(".no-products-message"); 

  if (!container || !totalDisplay) return;

  container.innerHTML = "";
  let total = 0;
  let totalWithDiscount = 0;

  if (cartItems.length === 0) {
    container.innerHTML = "<p class='empty-cart-message'>Tu carrito está vacío.</p>";
    totalDisplay.innerText = "$0";
    if (noProductsMessage) noProductsMessage.style.display = "block";
  } else {
    if (noProductsMessage) noProductsMessage.style.display = "none";

    cartItems.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      const itemDiscount = item.discount || 0;
      const discountedPrice = subtotal * (1 - itemDiscount);
      
      total += subtotal;
      totalWithDiscount += discountedPrice;

      container.innerHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div style="flex-grow:1;">
            <h4>${item.name}</h4>
            <div class="price-container">
              <span class="original-price">$${item.price.toLocaleString('es-AR')} c/u</span>
              ${item.discount ? `<span class="discounted-price">$${(item.price * (1 - item.discount)).toLocaleString('es-AR')} c/u</span>` : ''}
            </div>
            <div class="cart-controls">
              <button onclick="updateQuantity(${index}, -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            ${item.discount ? `<div class="discount-badge">-${Math.round(item.discount * 100)}%</div>` : ''}
          </div>
          <button class="cart-remove" onclick="removeItem(${index})">&times;</button>
          <button class="save-item" onclick="saveCartItem(${index})">Guardar</button>
        </div>
      `;
    });
  }

  // Mostrar resumen del carrito
  const summaryHtml = `
    <div class="cart-summary">
      <div class="summary-item">
        <span>Subtotal:</span>
        <span>$${total.toLocaleString('es-AR')}</span>
      </div>
      <div class="summary-item">
        <span>Descuentos:</span>
        <span>-$${(total - totalWithDiscount).toLocaleString('es-AR')}</span>
      </div>
      <div class="summary-item">
        <span>Envío:</span>
        <span>$${calculateDeliveryCost(totalWithDiscount).toLocaleString('es-AR')}</span>
      </div>
      <div class="summary-item total">
        <span>Total:</span>
        <span>$${(totalWithDiscount + calculateDeliveryCost(totalWithDiscount)).toLocaleString('es-AR')}</span>
      </div>
    </div>
  `;

  container.innerHTML += summaryHtml;
  totalDisplay.innerText = `$${(totalWithDiscount + calculateDeliveryCost(totalWithDiscount)).toLocaleString('es-AR')}`;
}

// Función para finalizar compra y limpiar carrito (para el botón de WhatsApp)
function checkoutCart() {
    if (cartItems.length === 0) {
        showNotification("Tu carrito está vacío. Agrega productos antes de finalizar la compra.", 'error');
        return;
    }

    // Calcular descuentos y totales
    const cartSummary = calculateCartSummary();
    
    // Crear mensaje para WhatsApp
    const mensaje = createWhatsAppMessage(cartSummary);
    
    // Tu número de WhatsApp de contacto
    const whatsappNumber = '5493814778577';

    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');

    // Guardar carrito actual
    saveCurrentCart();
    
    // Limpiar carrito y actualizar UI
    clearCart();
    toggleCartModal();
    
    // Mostrar resumen de la compra
    showPurchaseSummary(cartSummary);
}

// Función para limpiar el carrito completamente
function clearCart() {
    cartItems = [];
    localStorage.removeItem('cart');
    renderCart(); // Actualiza la visualización
    updateCartIcon(); // Actualiza el icono
    // Si estás en la página carrito.html, también podrías querer cerrar el modal si existiera
    // const modal = document.getElementById("cart-modal");
    // if (modal) modal.style.display = 'none';
}

// Esta sección de código estaba duplicada y fue eliminada para mantener el código limpio y organizado.
updateCartSummary();

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.price * item.quantity * (1 - (item.discount || 0) / 100)), 0
    );

    const summaryHtml = `
        <div class="summary-item">
            <span>Total de productos:</span>
            <span>${totalItems} items</span>
        </div>
        <div class="summary-item">
            <span>Subtotal:</span>
            <span>$${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-item total">
            <span>Total a pagar:</span>
            <span>$${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    `;

    cartSummary.innerHTML = summaryHtml;
}

// === Carga de datos al cargar el DOM ===
document.addEventListener('DOMContentLoaded', () => {
    // Solo si estamos en catalogo.html, cargamos los productos
    if (document.getElementById('catalogo-container')) {
        loadProducts() // Carga los productos desde productos.json
        .then(() => {
            filterProducts('Todos'); // Mostrar todos los productos al inicio
        })
        .catch(err => {
            console.error('Error al cargar los productos:', err);
            const container = document.getElementById('catalogo-container');
            if (container) {
                container.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
            }
        });
    }

    // Para carrito.html, asegurarnos de renderizar el carrito al cargar la página
    if (document.getElementById("cart-items") && document.getElementById("cart-total-price")) {
        renderCart();
    }
});

// === FUNCIONES DE FILTRADO Y RENDERIZADO ===

// Inicializar filtros
function initializeFilters() {
    // Crear filtros de categoría
    const categoryFilters = document.querySelector('.category-filters');
    if (categoryFilters) {
        categoryFilters.innerHTML = `
            <button onclick="filterProducts('Todos')" class="active">Todos</button>
            ${CONFIG.filters.categories.map(cat => `
                <button onclick="filterProducts('${cat}')">${cat}</button>
            `).join('')}
        `;
    }

    // Crear filtros de tipo
    const typeFilters = document.querySelector('.type-filters');
    if (typeFilters) {
        // Obtener todos los tipos únicos
        const allTypes = Array.from(new Set(allProducts.flatMap(p => p.tipo ? p.tipo.split(', ') : [])));
        typeFilters.innerHTML = `
            <button onclick="filterProducts('', 'Todos')" class="active">Todos</button>
            ${allTypes.map(tipo => `
                <button onclick="filterProducts('', '${tipo}')">${tipo}</button>
            `).join('')}
        `;
    }
}

// Filtra los productos por categoría y tipo
function filterProducts(category = 'Todos', tipo = 'Todos') {
    try {
        let filteredProducts = allProducts;
        
        if (category !== 'Todos') {
            filteredProducts = filteredProducts.filter(product => 
                product.categoria && product.categoria.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (tipo !== 'Todos') {
            // Buscar en la cadena de tipos separados por comas
            filteredProducts = filteredProducts.filter(product => 
                product.tipo && product.tipo.toLowerCase().includes(tipo.toLowerCase())
            );
        }
        
        renderProducts(filteredProducts);
        
        // Actualizar clase activa en los botones de filtro
        document.querySelectorAll('.category-filters button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === category || (category === 'Todos' && btn.textContent === 'Todos')) {
                btn.classList.add('active');
            }
        });
        
        // Actualizar clase activa en los filtros de tipo
        document.querySelectorAll('.type-filters button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === tipo || (tipo === 'Todos' && btn.textContent === 'Todos')) {
                btn.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error al filtrar productos:', error);
        renderProducts([]);
        showNotification('Error al filtrar productos. Por favor, inténtelo más tarde.', 'error');
    }
}

// Renderiza los productos en el contenedor del catálogo
function renderProducts(productsToRender) {
    try {
        const container = document.getElementById('catalogo-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!productsToRender || productsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-products-container">
                    <i class="fas fa-flower"></i>
                    <p class="no-products-found">No se encontraron productos en esta categoría.</p>
                    <p class="no-products-subtext">Por favor, intenta con otra categoría o tipo de flor.</p>
                </div>
            `;
            return;
        }
        
        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.imgUrl || 'img/default-product.jpg'}" alt="${product.descripcion || 'Producto'}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.descripcion || 'Producto sin nombre'}</h3>
                    <p class="product-type">Tipo: ${product.tipo || 'Sin especificar'}</p>
                    <p class="product-price">$${parseFloat(product.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    ${product.descuento ? `<p class="product-discount">Descuento: ${product.descuento}</p>` : ''}
                    <div class="actions">
                        <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(product)})'>
                            ${['Ramos','Plantas'].includes(product.categoria) ? 'Añadir al Carrito' : 'Consultar'}
                        </button>
                        <button class="add-to-wishlist-btn" onclick='addToWishlist(${JSON.stringify(product)})'>
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error al renderizar productos:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <p class="error-message">Error al cargar los productos. Por favor, inténtelo más tarde.</p>
            </div>
        `;
    }
}
