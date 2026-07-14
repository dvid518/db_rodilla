import { API_URL } from './config.js';

async function cargarResumen() {
    try {
        const res = await fetch(`${API_URL}/api/resumen`);
        const data = await res.json();
        document.getElementById('ingresosTotales').textContent = `S/ ${parseFloat(data.ingresos || 0).toFixed(2)}`;
        document.getElementById('totalPedidos').textContent = data.pedidos || 0;
        document.getElementById('totalClientes').textContent = data.clientes || 0;
        document.getElementById('totalProductos').textContent = data.productos || 0;
    } catch (error) {
        console.error('Error cargando resumen:', error);
    }
}

async function cargarPedidosRecientes() {
    try {
        const res = await fetch(`${API_URL}/api/pedidos-recientes`);
        const pedidos = await res.json();
        const div = document.getElementById('pedidosRecientes');
        if (pedidos && pedidos.length > 0) {
            div.innerHTML = pedidos.map(p => `
                <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee;">
                    <span>#${p.id_pedido} - ${p.nombre}</span>
                    <span>S/ ${parseFloat(p.total).toFixed(2)}</span>
                    <span>${new Date(p.fecha_pedido).toLocaleDateString()}</span>
                </div>
            `).join('');
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin pedidos recientes</p>';
        }
    } catch (error) {
        console.error('Error cargando pedidos recientes:', error);
    }
}

async function cargarProductosAdmin() {
    try {
        const res = await fetch(`${API_URL}/api/productos-admin`);
        const data = await res.json();
        const div = document.getElementById('productosLista');
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">ID</th>
                        <th style="padding:10px;text-align:left;">Nombre</th>
                        <th style="padding:10px;text-align:left;">Precio</th>
                        <th style="padding:10px;text-align:left;">Categoría</th>
                    </tr>
                    ${data.map(p => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${p.id_producto}</td>
                            <td style="padding:10px;">${p.nombre}</td>
                            <td style="padding:10px;">S/ ${parseFloat(p.precio).toFixed(2)}</td>
                            <td style="padding:10px;">${p.categoria || '-'}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin productos</p>';
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

async function cargarPedidosAdmin() {
    try {
        const res = await fetch(`${API_URL}/api/pedidos`);
        const data = await res.json();
        const div = document.getElementById('pedidosLista');
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">#</th>
                        <th style="padding:10px;text-align:left;">Cliente</th>
                        <th style="padding:10px;text-align:left;">Total</th>
                        <th style="padding:10px;text-align:left;">Fecha</th>
                        <th style="padding:10px;text-align:left;">Estado</th>
                    </tr>
                    ${data.map(p => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${p.id_pedido}</td>
                            <td style="padding:10px;">${p.nombre}</td>
                            <td style="padding:10px;">S/ ${parseFloat(p.total).toFixed(2)}</td>
                            <td style="padding:10px;">${new Date(p.fecha_pedido).toLocaleDateString()}</td>
                            <td style="padding:10px;">${p.estado || 'completado'}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin pedidos</p>';
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
    }
}

async function cargarClientesAdmin() {
    try {
        const res = await fetch(`${API_URL}/api/clientes`);
        const data = await res.json();
        const div = document.getElementById('clientesLista');
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">ID</th>
                        <th style="padding:10px;text-align:left;">Nombre</th>
                        <th style="padding:10px;text-align:left;">Email</th>
                        <th style="padding:10px;text-align:left;">Teléfono</th>
                    </tr>
                    ${data.map(c => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${c.id_cliente}</td>
                            <td style="padding:10px;">${c.nombre}</td>
                            <td style="padding:10px;">${c.email}</td>
                            <td style="padding:10px;">${c.telefono || '-'}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin clientes</p>';
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.tab + 'Content').classList.add('active');
        if (this.dataset.tab === 'resumen') {
            cargarResumen();
            cargarPedidosRecientes();
        } else if (this.dataset.tab === 'productos') cargarProductosAdmin();
        else if (this.dataset.tab === 'pedidos') cargarPedidosAdmin();
        else if (this.dataset.tab === 'clientes') cargarClientesAdmin();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    cargarResumen();
    cargarPedidosRecientes();
});