let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartIcon() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) { // Asegurarse de que el elemento existe
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function addToCart(product) {
  // Si el producto es de tipo "consultar" (Iglesias, Fiestas, Novias), ir directo a WhatsApp
  if (!['Ramos', 'Plantas'].includes(product.categoria)) {
    consultar(product.descripcion); // Llama a la función de consulta existente
    return;
  }

  const existingProduct = cart.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartIcon();
  alert(`"${product.descripcion}" añadido al carrito.`);
  // Aquí podrías añadir una animación o un mensaje más sofisticado
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
  updateCartIcon();
}

function updateCartQuantity(productId, newQuantity) {
  const product = cart.find(item => item.id === productId);
  if (product) {
    product.quantity = parseInt(newQuantity);
    if (product.quantity <= 0) {
      removeFromCart(productId);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartIcon();
  }
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      const itemPrice = (item.precio * item.quantity).toFixed(2);
      itemDiv.innerHTML = `
        <img src="${item.imgUrl}" alt="${item.descripcion}">
        <div class="item-details">
          <h4>${item.descripcion}</h4>
          <p>$${item.precio.toFixed(2)} c/u</p>
          <div class="quantity-controls">
            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeFromCart('${item.id}')">X</button>
      `;
      cartItemsContainer.appendChild(itemDiv);
      total += item.precio * item.quantity;
    });
  }
  cartTotalAmount.textContent = total.toFixed(2);
}

function toggleCartModal() {
  const modal = document.getElementById('cart-modal');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
  if (modal.style.display === 'block') {
    renderCartItems(); // Renderizar el carrito cada vez que se abre
  }
}

function checkoutCart() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
    return;
  }

  let message = "Hola, mi pedido de Florería y Vivero Cristina es:\n\n";
  let total = 0;
  cart.forEach(item => {
    message += `- ${item.quantity} x ${item.descripcion} ($${(item.precio * item.quantity).toFixed(2)})\n`;
    total += item.precio * item.quantity;
  });
  message += `\nTotal estimado: $${total.toFixed(2)}`;
  message += `\n\n¡Espero tu confirmación!`;

  window.open(`https://wa.me/5493813671352?text=${encodeURIComponent(message)}`, '_blank');
  clearCart(); // Opcional: vaciar el carrito después de enviar el pedido
  toggleCartModal(); // Cerrar el modal
}

function clearCart() {
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cart = [];
    localStorage.removeItem('cart');
    renderCartItems();
    updateCartIcon();
  }
}

function consultar(nombre) {
  const msg = `Hola, quisiera información sobre "${nombre}".`;
  window.open(`https://wa.me/5493813671352?text=${encodeURIComponent(msg)}`, '_blank');
}

// Inicializar el icono del carrito al cargar la página
document.addEventListener('DOMContentLoaded', updateCartIcon);

<script>
let cartItems = [];

function openCart() {
  document.getElementById("cart-modal").style.display = "block";
  renderCart();
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

function clearCart() {
  cartItems = [];
  renderCart();
  updateCartCount();
}

// Esta función se puede vincular al botón "Añadir al carrito"
function addToCart(name, price, image) {
  const existingItem = cartItems.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ name, price, image, quantity: 1 });
  }
  renderCart();
  updateCartCount();
}

function removeItem(index) {
  cartItems.splice(index, 1);
  renderCart();
  updateCartCount();
}

function updateQuantity(index, change) {
  const item = cartItems[index];
  item.quantity += change;
  if (item.quantity <= 0) removeItem(index);
  else renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total-price");
  container.innerHTML = "";
  let total = 0;

  if (cartItems.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalDisplay.innerText = "$0";
    return;
  }

  cartItems.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div style="flex-grow:1;">
          <h4>${item.name}</h4>
          <span>$${item.price.toLocaleString()} c/u</span>
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

  totalDisplay.innerText = "$" + total.toLocaleString();
}

function updateCartCount() {
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}
</script>
