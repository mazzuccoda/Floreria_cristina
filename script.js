function comprar(nombre, precio) {
  const msg = `Hola, quiero comprar "${nombre}" por $${precio}.`;
  window.open(`https://wa.me/5493813671352?text=${encodeURIComponent(msg)}`, '_blank');
}

function consultar(nombre) {
  const msg = `Hola, quisiera info sobre "${nombre}".`;
  window.open(`https://wa.me/5493813671352?text=${encodeURIComponent(msg)}`, '_blank');
}