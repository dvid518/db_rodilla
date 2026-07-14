let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function agregarCarrito(id) {
    const item = carrito.find(i => i.id === id);
    if (item) item.cantidad++;
    else carrito.push({ id, cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado');
}

function renderCarrito() {
    const list = document.getElementById('list');
    const empty = document.getElementById('empty');
    const summary = document.getElementById('summary');
    const totalSpan = document.getElementById('total');
    if (!carrito.length) {
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
    carrito.forEach(async (item, index) => {
        const p = await queryPG(`SELECT nombre, precio FROM productos WHERE id_producto = ${item.id}`);
        if (p && p.length) {
            const subtotal = p[0].precio * item.cantidad;
            total += subtotal;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${p[0].nombre}</span>
                <span>${item.cantidad} x S/ ${parseFloat(p[0].precio).toFixed(2)}</span>
                <span>S/ ${subtotal.toFixed(2)}</span>
                <button onclick="eliminarDelCarrito(${index})">✕</button>
            `;
            list.appendChild(div);
        }
    });
    totalSpan.textContent = `S/ ${total.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

function vaciarCarrito() {
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

async function comprar() {
    if (!carrito.length) return alert('Carrito vacío');
    const idCliente = parseInt(localStorage.getItem('userId')) || 1;
    const sql = `INSERT INTO pedidos (id_cliente) VALUES (${idCliente}) RETURNING id_pedido`;
    const result = await insertPG(sql);
    const idPedido = result.rows[0].id_pedido;
    for (const item of carrito) {
        const detalle = `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad) VALUES (${idPedido}, ${item.id}, ${item.cantidad})`;
        await insertPG(detalle);
    }
    alert('Pedido completado');
    vaciarCarrito();
}

document.addEventListener('DOMContentLoaded', renderCarrito);