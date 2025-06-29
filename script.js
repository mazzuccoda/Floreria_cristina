const SHEET_URL = 'https://opensheet.elk.sh/1cUDaB8ZKBL-hzG7dYJFUpx7E4roImbej6MVW7F-15LA/Hoja1';
let productos = [];
let categoriaSeleccionada = 'Todos';
let floresSeleccionadas = new Set();
let tiposDeFlor = [];

document.addEventListener('DOMContentLoaded', async () => {
  productos = await cargarDatos();
  detectarTiposDeFlor(productos);
  renderFiltrosDeFlor();
  renderProductos();
  actualizarContadorCarrito();
});

async function cargarDatos() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  return data.filter(p => p['ACTIVO'] === '1');
}

function detectarTiposDeFlor(productos) {
  const ejemplo = productos[0];
  const columnasFijas = ['id Producto', 'CATEGORÍA', 'LINK_DE_FOTO', 'NOMBRE', 'DESCRIPCION', 'PRECIO', 'DESCUENTO', 'STOCK', 'ACTIVO'];
  tiposDeFlor = Object.keys(ejemplo).filter(k => !columnasFijas.includes(k));
}

function renderFiltrosDeFlor() {
  const filtros = document.createElement('div');
  filtros.id = 'filtros-laterales';
  filtros.style.padding = '20px';
  filtros.style.maxWidth = '240px';
  filtros.style.marginLeft = '30px';
  filtros.style.background = '#f9f9f9';
  filtros.style.border = '1px solid #ddd';
  filtros.style.borderRadius = '8px';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Filtrar por flor';
  titulo.style.marginTop = '0';
  filtros.appendChild(titulo);

  tiposDeFlor.forEach(flor => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '8px';
    label.innerHTML = `<input type="checkbox" value="${flor}"> ${flor}`;
    label.querySelector('input').addEventListener('change', (e) => {
      const { value, checked } = e.target;
      checked ? floresSeleccionadas.add(value) : floresSeleccionadas.delete(value);
      renderProductos();
    });
    filtros.appendChild(label);
  });

  const main = document.querySelector('main');
  main.insertBefore(filtros, document.getElementById('catalogo-container'));
}

function renderProductos() {
  const contenedor = document.getElementById('catalogo-container');
  contenedor.innerHTML = '';

  const filtrados = productos.filter(p => {
    const coincideCategoria = categoriaSeleccionada === 'Todos' || p['CATEGORÍA'] === categoriaSeleccionada;
    const coincideFlor = floresSeleccionadas.size === 0 ||
      [...floresSeleccionadas].some(f => (p[f] + '').trim() === '1');
    return coincideCategoria && coincideFlor;
  });

  if (filtrados.length === 0) {
    contenedor.innerHTML = '<p>No hay productos que coincidan con los filtros.</p>';
    return;
  }

  filtrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p['LINK_DE_FOTO']}" alt="${p['NOMBRE']}">
      <h3>${p['NOMBRE']}</h3>
      <p>$${parseFloat(p['PRECIO']).toFixed(2)}</p>
      <button onclick="agregarAlCarrito('${p['id Producto']}', '${p['NOMBRE']}', ${parseFloat(p['PRECIO'])})">Agregar</button>
    `;
    contenedor.appendChild(card);
  });
}

function filterProducts(categoria) {
  categoriaSeleccionada = categoria;
  renderProductos();
}

function agregarAlCarrito(id, nombre, precio) {
  const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
  const existente = carrito.find(p => p.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
  const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  document.getElementById('cart-count').textContent = total;
}

function toggleCartModal() {
  document.getElementById('cart-modal').classList.toggle('visible');
}

function clearCart() {
  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
  toggleCartModal();
}
