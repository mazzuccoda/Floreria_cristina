// script.js

// === VARIABLES GLOBALES ===
let cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Carrito de compras
let allProducts = []; // Para almacenar todos los productos cargados desde Google Sheets

// === FUNCIONES DE CARRITO ===

// Función para actualizar el contador del carrito en el icono del header
function updateCartIcon() {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
  }
}

// Función para añadir productos al carrito
function addToCart(product) {
  // Si el producto es de tipo "consultar" (Iglesias, Fiestas, Novias), ir directo a WhatsApp
  if (!['Ramos', 'Plantas'].includes(product.categoria)) {
    consultarProducto(product);
    return;
  }

  const existingProduct = cartItems.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    // Asegúrate de que el 'image' se guarde para el carrito.
    // Usamos product.imgUrl porque así lo llamas en tus datos de Google Sheets.
    cartItems.push({ ...product, name: product.descripcion, price: parseFloat(product.precio), image: product.imgUrl, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartIcon();
  alert(`"${product.descripcion}" añadido al carrito.`);
  // Aquí podrías añadir una animación o un mensaje más sofisticado
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
  if (modal) { // Asegurarse de que el modal existe en la página actual (ej. catalogo.html)
      modal.style.display = modal.style.display === "block" ? "none" : "block";
      if (modal.style.display === "block") {
          renderCart(); // Renderiza el carrito cada vez que se abre el modal
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
  // Asegurarse de seleccionar el mensaje de "no products" si existe
  const noProductsMessage = document.querySelector(".no-products-message"); 

  if (!container || !totalDisplay) {
    // Si no encontramos los elementos del carrito, no hacemos nada (útil para páginas sin carrito)
    return;
  }

  container.innerHTML = ""; // Limpiar el contenedor antes de renderizar
  let total = 0;

  if (cartItems.length === 0) {
    container.innerHTML = "<p class='empty-cart-message'>Tu carrito está vacío.</p>"; // Mensaje en el contenedor de items
    totalDisplay.innerText = "$0";
    if (noProductsMessage) noProductsMessage.style.display = "block"; // Mostrar el mensaje si existe
  } else {
    if (noProductsMessage) noProductsMessage.style.display = "none"; // Ocultar el mensaje si hay productos

    cartItems.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      container.innerHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div style="flex-grow:1;">
            <h4>${item.name}</h4>
            <span>$${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u</span>
            <div class="cart-controls">
              <button onclick="updateQuantity(${index}, -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="removeItem(${index})">&times;</button>
        </div>
      `;
    });
  }
  totalDisplay.innerText = "$" + total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


// Función para finalizar compra y limpiar carrito (para el botón de WhatsApp)
function checkoutCart() {
    if (cartItems.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
        return;
    }

    const resumen = cartItems.map(p => `• ${p.name} - $${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} x ${p.quantity}`).join('\n');
    const total = cartItems.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const mensaje = `Hola, quiero comprar:\n${resumen}\nTotal: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Tu número de WhatsApp de contacto
    const whatsappNumber = '5493814778577'; // Asegúrate de que sea el correcto

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');

    // Opcional: limpiar el carrito después de enviar a WhatsApp
    // clearCart();
    // toggleCartModal(); // Cerrar el modal si estás en el modal del catálogo
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
        <p class="product-price">$${parseFloat(product.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        ${product.descuento ? `<p class="product-discount">Descuento: ${product.descuento}</p>` : ''}
        <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(product)})'>
          ${['Ramos','Plantas'].includes(product.categoria) ? 'Añadir al Carrito' : 'Consultar'}
        </button>
      </div>
    `;
    container.appendChild(productCard);
  });
}

// Filtra los productos por categoría
function filterProducts(category) {
  if (category === 'Todos') {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.categoria === category);
    renderProducts(filtered);
  }
}

// === Carga de datos desde Google Sheets al cargar el DOM ===
document.addEventListener('DOMContentLoaded', () => {
    // Solo si estamos en catalogo.html, cargamos los productos
    if (document.getElementById('catalogo-container')) {
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSuWDiLqjNQr0EIVb2zuyzzKMzgn1MHeu6me8QSE2KejtocSuEbHFkY4tma_rDTcl-Ba3Z7TldQpeGQ/pub?output=csv')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(csv => {
                const rows = csv.trim().split('\n').slice(1); // Ignorar la primera fila (encabezados)
                allProducts = rows.map(line => {
                    // Asegúrate de que el orden y el número de columnas coincidan con tu hoja
                    const [id, categoria, imgUrl, descripcion, precio, descuento] = line.split(',');
                    return { id, categoria, imgUrl, descripcion, precio: parseFloat(precio), descuento: descuento || null };
                });
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
