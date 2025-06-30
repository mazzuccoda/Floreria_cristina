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
async function loadProducts() {
    try {
        // URL de la hoja de Google Sheets en formato JSON
        const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1cUDaB8ZKBL-hzG7dYJFUpx7E4roImbej6MVW7F-15LA/gviz/tq?tqx=out:json&tq=SELECT%20*';
        
        const response = await fetch(googleSheetUrl);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const text = await response.text();
        const data = JSON.parse(text.substring(47).slice(0, -2));
        
        allProducts = data.table.rows.map(row => {
            const values = row.c.map(cell => cell ? cell.v : '');
            // Obtener todos los tipos no vacíos
            const tipos = values.slice(9).filter(tipo => tipo).join(', ');
            return {
                id: values[0],
                categoria: values[2],
                tipo: tipos,
                descripcion: values[1],
                precio: values[3],
                imgUrl: values[4],
                descuento: values[5]
            };
        });
        
        renderProducts(allProducts);
        initializeFilters();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        allProducts = [];
        renderProducts([]);
        showNotification('Error al cargar los productos. Por favor, inténtelo más tarde.', 'error');
    }
}

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

// === FUNCIONES DE CARGA Y FILTRADO DE PRODUCTOS (Para catalogo.html) ===

// Filtra los productos por categoría y tipo
function filterProducts(category, tipo = '') {
    let filteredProducts = category === 'Todos' ? allProducts : allProducts.filter(p => p.categoria === category);
    
    if (tipo && tipo !== 'Todos') {
        filteredProducts = filteredProducts.filter(p => p.tipo === tipo);
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
        if (btn.textContent === tipo || (tipo === '' && btn.textContent === 'Todos')) {
            btn.classList.add('active');
        }
    });
}

// Renderiza los productos en el contenedor del catálogo
function renderProducts(productsToRender) {
  const container = document.getElementById('catalogo-container');
  if (!container) return; // Asegúrate de que el contenedor existe
  container.innerHTML = ''; // Limpiar el contenedor antes de añadir productos

  if (productsToRender.length === 0) {
    container.innerHTML = '<p class="no-products-found">No se encontraron productos en esta categoría.</p>';
    return;
  }

  productsToRender.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="${product.imgUrl}" alt="${product.descripcion}">
      <div class="product-info">
        <h3>${product.descripcion}</h3>
        <p class="product-type">Tipo: ${product.tipo}</p>
        <p class="product-price">$${parseFloat(product.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
}

// Actualizar el carrito
function updateCartSummary() {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;

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
