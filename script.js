// script.js
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

// === VARIABLES GLOBALES ===
let cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Carrito de compras
let allProducts = []; // Para almacenar todos los productos
let userPoints = parseInt(localStorage.getItem('userPoints')) || 0; // Sistema de puntos
let wishList = JSON.parse(localStorage.getItem('wishList')) || []; // Lista de deseos
let savedCarts = JSON.parse(localStorage.getItem('savedCarts')) || {}; // Carritos guardados

// === FUNCIONES DE CARGA DE DATOS ===
// Datos estáticos de productos
const staticProducts = [
    {
        id: "1",
        categoria: "Ramos",
        tipo: "Clásico",
        descripcion: "Ramo de rosas rojas",
        precio: 1500,
        imgUrl: "img/ramo-rosas.jpg",
        descuento: null
    },
    {
        id: "2",
        categoria: "Plantas",
        tipo: "Interior",
        descripcion: "Planta de suculenta",
        precio: 800,
        imgUrl: "img/planta-suculenta.jpg",
        descuento: 10
    },
    {
        id: "3",
        categoria: "Novias",
        tipo: "Bouquet",
        descripcion: "Bouquet de novia con rosas y baby's breath",
        precio: 2500,
        imgUrl: "img/bouquet-novia.jpg",
        descuento: null
    },
    {
        id: "4",
        categoria: "Iglesias",
        tipo: "Arreglo",
        descripcion: "Arreglo para altar con lirios y orquídeas",
        precio: 3500,
        imgUrl: "img/arreglo-altar.jpg",
        descuento: 15
    },
    {
        id: "5",
        categoria: "Fiestas",
        tipo: "Decoración",
        descripcion: "Centro de mesa con flores de temporada",
        precio: 1800,
        imgUrl: "img/centro-mesa.jpg",
        descuento: null
    }
];

// Función para cargar productos
function loadProducts() {
    return new Promise((resolve, reject) => {
        try {
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

// Exportar la función para que esté disponible en el HTML
window.loadProducts = loadProducts;

// Función para renderizar los productos en el catálogo
function renderProducts(products) {
    try {
        const container = document.getElementById('catalogo-container');
        if (!container) {
            throw new Error('No se encontró el contenedor de productos');
        }

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No hay productos disponibles en este momento</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        products.forEach(product => {
            const productHtml = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imgUrl}" alt="${product.descripcion}">
                        ${product.descuento ? `<div class="discount-badge">-${product.descuento}%</div>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.descripcion}</h3>
                        <p class="product-type">${product.tipo || 'Sin especificar'}</p>
                        <div class="product-price">
                            <span class="price">$${product.precio.toLocaleString('es-AR')}</span>
                            ${product.descuento ? `
                                <span class="original-price">$${(product.precio * (1 + parseFloat(product.descuento) / 100)).toLocaleString('es-AR')}</span>
                            ` : ''}
                        </div>
                        <div class="product-actions">
                            <button onclick="addToCart(${JSON.stringify(product)})" class="add-to-cart">
                                <i class="fas fa-cart-plus"></i> Añadir al Carrito
                            </button>
                            <button onclick="consultarProducto(${JSON.stringify(product)})" class="consult-btn">
                                <i class="fas fa-comment"></i> Consultar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += productHtml;
        });
    } catch (error) {
        console.error('Error al renderizar productos:', error);
        const container = document.getElementById('catalogo-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al renderizar los productos: ${error.message}</p>
                </div>
            `;
        }
    }
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
