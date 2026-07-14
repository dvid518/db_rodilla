import { API_URL } from './config.js';

// ============================================================
// FUNCIONES PARA CARGAR DATOS
// ============================================================

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
    const div = document.getElementById('productosLista');
    div.innerHTML = '<p style="text-align:center;color:#888;">Cargando...</p>';
    try {
        const res = await fetch(`${API_URL}/api/productos-admin`);
        const data = await res.json();
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">ID</th>
                        <th style="padding:10px;text-align:left;">Nombre</th>
                        <th style="padding:10px;text-align:left;">Precio</th>
                        <th style="padding:10px;text-align:left;">Categoría</th>
                    </tr></thead>
                    <tbody>${data.map(p => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${p.id_producto}</td>
                            <td style="padding:10px;">${p.nombre}</td>
                            <td style="padding:10px;">S/ ${parseFloat(p.precio).toFixed(2)}</td>
                            <td style="padding:10px;">${p.categoria || '-'}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin productos</p>';
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        div.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error al cargar productos</p>';
    }
}

async function cargarPedidosAdmin() {
    const div = document.getElementById('pedidosLista');
    div.innerHTML = '<p style="text-align:center;color:#888;">Cargando...</p>';
    try {
        const res = await fetch(`${API_URL}/api/pedidos`);
        const data = await res.json();
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">ID</th>
                        <th style="padding:10px;text-align:left;">Cliente</th>
                        <th style="padding:10px;text-align:left;">Total</th>
                        <th style="padding:10px;text-align:left;">Fecha</th>
                        <th style="padding:10px;text-align:left;">Estado</th>
                    </tr></thead>
                    <tbody>${data.map(p => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">#${p.id_pedido}</td>
                            <td style="padding:10px;">${p.nombre}</td>
                            <td style="padding:10px;">S/ ${parseFloat(p.total).toFixed(2)}</td>
                            <td style="padding:10px;">${new Date(p.fecha_pedido).toLocaleDateString()}</td>
                            <td style="padding:10px;">${p.estado || 'completado'}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin pedidos</p>';
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        div.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error al cargar pedidos</p>';
    }
}

async function cargarClientesAdmin() {
    const div = document.getElementById('clientesLista');
    div.innerHTML = '<p style="text-align:center;color:#888;">Cargando...</p>';
    try {
        const res = await fetch(`${API_URL}/api/clientes`);
        const data = await res.json();
        if (data && data.length > 0) {
            div.innerHTML = `
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="padding:10px;text-align:left;">ID</th>
                        <th style="padding:10px;text-align:left;">Nombre</th>
                        <th style="padding:10px;text-align:left;">Email</th>
                        <th style="padding:10px;text-align:left;">Teléfono</th>
                    </tr></thead>
                    <tbody>${data.map(c => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${c.id_cliente}</td>
                            <td style="padding:10px;">${c.nombre}</td>
                            <td style="padding:10px;">${c.email}</td>
                            <td style="padding:10px;">${c.telefono || '-'}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            `;
        } else {
            div.innerHTML = '<p style="text-align:center;color:#666;">Sin clientes</p>';
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        div.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error al cargar clientes</p>';
    }
}

// ============================================================
// CONFIGURAR TABS
// ============================================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        document.getElementById(tab + 'Content').classList.add('active');

        switch(tab) {
            case 'resumen':
                cargarResumen();
                cargarPedidosRecientes();
                break;
            case 'productos':
                cargarProductosAdmin();
                break;
            case 'pedidos':
                cargarPedidosAdmin();
                break;
            case 'clientes':
                cargarClientesAdmin();
                break;
        }
    });
});

// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    cargarResumen();
    cargarPedidosRecientes();
});