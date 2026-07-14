async function cargarProductos() {
    const sql = "SELECT id_producto, nombre, precio, categoria FROM productos WHERE activo = true ORDER BY nombre";
    const productos = await queryPG(sql);
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    if (!productos || productos.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#888;">No hay productos disponibles</p>';
        return;
    }
    productos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <h3>${p.nombre}</h3>
            <p class="categoria">${p.categoria || 'General'}</p>
            <p class="precio">S/ ${parseFloat(p.precio).toFixed(2)}</p>
            <button onclick="agregarCarrito(${p.id_producto})">Agregar</button>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', cargarProductos);