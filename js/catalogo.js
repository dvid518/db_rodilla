import { API_URL } from './config.js';

async function cargarProductos() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;color:#888;">Cargando productos...</p>';

    try {
        const res = await fetch(`${API_URL}/api/productos`);
        if (!res.ok) {
            console.error('Error al cargar productos:', res.status);
            grid.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error al cargar productos</p>';
            return;
        }
        const productos = await res.json();

        if (!productos || productos.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:#888;">No hay productos disponibles</p>';
            return;
        }

        grid.innerHTML = '';
        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <h3>${p.nombre}</h3>
                <p class="categoria">${p.categoria || 'General'}</p>
                <p class="precio">S/ ${parseFloat(p.precio).toFixed(2)}</p>
                <button onclick="window.agregarCarrito(${p.id_producto})">Agregar al Carrito</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error en cargarProductos:', error);
        grid.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error de conexión con el servidor</p>';
    }
}

window.agregarCarrito = function(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const item = carrito.find(i => i.id === id);
    if (item) item.cantidad++;
    else carrito.push({ id, cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
};

document.addEventListener('DOMContentLoaded', cargarProductos);