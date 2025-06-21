// script.js

// Variable global del carrito (renombrada de 'cart' a 'cartItems' para claridad y evitar confusión con el archivo cart.js antiguo)
// Asegúrate de que esta variable sea la que se utiliza en todas las funciones de carrito.
let cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Mantén 'cart' como clave en localStorage por ahora para no perder datos existentes.

// Función que actualiza el icono del carrito en el header (usada en catalogo.html)
function updateCartIcon() {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
  }
}

// Función para añadir productos al carrito (desde catalogo.html)
function addToCart(product) {
  // Si el producto es de tipo "consultar" (Iglesias, Fiestas, Novias), ir directo a WhatsApp
  if (!['Ramos', 'Plantas'].includes(product.categoria)) {
    // Reemplaza esta línea con la lógica que abre WhatsApp para consulta.
    // Esta función 'consultar' no está definida en tu script.js, la implementaremos abajo.
    consultarProducto(product);
    return;
  }

  const existingProduct = cartItems.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    // Asegúrate de que el 'image' se guarde para el carrito.
    // Usaremos product.imgUrl ya que es el nombre de la propiedad en tus datos de Google Sheets.
    cartItems.push({ ...product, name: product.descripcion, price: product.precio, image: product.imgUrl, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartIcon();
  alert(`"${product.descripcion}" añadido al carrito.`);
  // Aquí podrías añadir una animación o un mensaje más sofisticado
}

// Función para abrir WhatsApp para productos de consulta (nueva función)
function consultarProducto(product) {
  const mensaje = `Hola, quiero consultar sobre: ${product.descripcion} (${product.categoria}). ¿Me podrías dar más información?`;
  window.open(`https://wa.me/5493814778577?text=${encodeURIComponent(mensaje)}`, '_blank'); // Reemplaza con tu número de WhatsApp
}


// --- Funciones para el MODAL del carrito (usadas en carrito.html y catalogo.html) ---

// Función para inicializar el carrito al cargar la página
// (Nota: esta función se llamará automáticamente al cargar el script, no necesitas un DOMContentLoaded para ella)
function loadCart() {
    cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartIcon(); // Asegura que el ícono del carrito se actualice al cargar cualquier página
}

// Llama a loadCart al inicio para cargar el carrito
loadCart();


// Funciones para manejar la apertura y cierre del modal
function toggleCartModal() {
  const modal = document.getElementById("cart-modal");
  if (modal) { // Asegurarse de que el modal existe en la página actual
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

// Renderizar los elementos del carrito en el modal
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total-price");
  const noProductsMessage = document.querySelector(".no-products-message"); // Asumiendo que existe este elemento en carrito.html

  if (!container || !totalDisplay) return; // Asegúrate de que los elementos existan

  container.innerHTML = "";
  let total = 0;

  if (cartItems.length === 0) {
    container.innerHTML = "<p class='empty-cart-message'>Tu carrito está vacío.</p>"; // Clase para estilizar
    totalDisplay.innerText = "$0";
    if (noProductsMessage) noProductsMessage.style.display = "block"; // Mostrar el mensaje si el carrito está vacío en carrito.html
    return;
  } else {
    if (noProductsMessage) noProductsMessage.style.display = "none"; // Ocultar el mensaje si el carrito tiene productos
  }

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
    // toggleCartModal(); // Cerrar el modal
}

// Función para limpiar el carrito completamente
function clearCart() {
    cartItems = [];
    localStorage.removeItem('cart');
    renderCart(); // Actualiza la visualización
    updateCartIcon(); // Actualiza el icono
}

// Asegurarse de que el carrito se renderice cuando el DOM esté cargado para carrito.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("cart-modal")) { // Solo si el modal existe en esta página
        renderCart();
    }
});

// Función para mostrar/ocultar el mensaje de "Tu carrito está vacío" en carrito.html
function checkCartEmptyMessage() {
    const noProductsMessage = document.querySelector(".no-products-message");
    if (noProductsMessage) {
        if (cartItems.length === 0) {
            noProductsMessage.style.display = "block";
        } else {
            noProductsMessage.style.display = "none";
        }
    }
}

// Asegúrate de llamar a checkCartEmptyMessage en los lugares relevantes
// Por ejemplo, al cargar la página y después de cualquier operación del carrito
document.addEventListener('DOMContentLoaded', checkCartEmptyMessage);

// Modifica renderCart y clearCart para que también llamen a checkCartEmptyMessage
// Esto es para asegurar que el mensaje de "carrito vacío" se actualice automáticamente
// cada vez que el carrito se renderiza o se limpia.
const originalRenderCart = renderCart;
renderCart = function() {
    originalRenderCart();
    checkCartEmptyMessage();
};

const originalClearCart = clearCart;
clearCart = function() {
    originalClearCart();
    checkCartEmptyMessage();
};
