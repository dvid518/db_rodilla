import { API_URL } from './config.js';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

async function renderCarrito() {
    const list = document.getElementById('list');
    const empty = document.getElementById('empty');
    const summary = document.getElementById('summary');
    const totalSpan = document.getElementById('total');

    if (!carrito || carrito.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        summary.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    list.style.display = 'flex';
    summary.style.display = 'flex';
    list.innerHTML = '';
    let total = 0;

    for (const item of carrito) {
        try {
            const res = await fetch(`${API_URL}/api/productos`);
            const productos = await res.json();
            const p = productos.find(prod => prod.id_producto === item.id);
            if (p) {
                const subtotal = p.precio * item.cantidad;
                total += subtotal;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <span>${p.nombre}</span>
                    <span>${item.cantidad} x S/ ${parseFloat(p.precio).toFixed(2)}</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                    <button onclick="window.eliminarDelCarrito(${carrito.indexOf(item)})">✕</button>
                `;
                list.appendChild(div);
            }
        } catch (error) {
            console.error('Error cargando producto del carrito:', error);
        }
    }
    totalSpan.textContent = `S/ ${total.toFixed(2)}`;
}

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
};

window.vaciarCarrito = function() {
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
};

window.comprar = async function() {
    if (!carrito || carrito.length === 0) {
        alert('Carrito vacío');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Debes iniciar sesión para comprar');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/pedido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cliente: parseInt(userId),
                items: carrito
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Pedido #${data.id_pedido} completado. Total: S/ ${parseFloat(data.total).toFixed(2)}`);
            window.vaciarCarrito();
        } else {
            alert('Error al crear el pedido');
        }
    } catch (error) {
        console.error('Error al comprar:', error);
        alert('Error de conexión');
    }
};

document.addEventListener('DOMContentLoaded', renderCarrito);