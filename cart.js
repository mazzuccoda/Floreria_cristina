let cart = JSON.parse(localStorage.getItem('carrito')) || [];

function agregarAlCarrito(nombre, precio) {
  cart.push({ nombre, precio });
  localStorage.setItem('carrito', JSON.stringify(cart));
  alert(`"${nombre}" agregado al carrito.`);
}

function verCarrito() {
  const items = JSON.parse(localStorage.getItem('carrito')) || [];
  if (items.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const resumen = items.map(p => `• ${p.nombre} - $${p.precio}`).join('\n');
  const total = items.reduce((sum, p) => sum + parseFloat(p.precio), 0);
  const mensaje = `Hola, quiero comprar:\n${resumen}\nTotal: $${total}`;
  window.open(`https://wa.me/5493813671352?text=${encodeURIComponent(mensaje)}`, '_blank');
}
