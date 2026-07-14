async function cargarResumen() {
    const ingresos = await queryPG("SELECT COALESCE(SUM(total), 0) as total FROM pedidos");
    const pedidos = await queryPG("SELECT COUNT(*) as count FROM pedidos");
    const clientes = await queryPG("SELECT COUNT(*) as count FROM clientes");
    const productos = await queryPG("SELECT COUNT(*) as count FROM productos");
    document.getElementById('ingresosTotales').textContent = `S/ ${parseFloat(ingresos[0]?.total || 0).toFixed(2)}`;
    document.getElementById('totalPedidos').textContent = pedidos[0]?.count || 0;
    document.getElementById('totalClientes').textContent = clientes[0]?.count || 0;
    document.getElementById('totalProductos').textContent = productos[0]?.count || 0;
    const recientes = await queryPG(`
        SELECT p.id_pedido, c.nombre, p.total, p.fecha_pedido 
        FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente 
        ORDER BY p.fecha_pedido DESC LIMIT 5
    `);
    const div = document.getElementById('pedidosRecientes');
    if (recientes && recientes.length) {
        div.innerHTML = recientes.map(p => `
            <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee;">
                <span>#${p.id_pedido} - ${p.nombre}</span>
                <span>S/ ${parseFloat(p.total).toFixed(2)}</span>
                <span>${new Date(p.fecha_pedido).toLocaleDateString()}</span>
            </div>
        `).join('');
    } else {
        div.innerHTML = '<p style="text-align:center;color:#666;">Sin pedidos recientes</p>';
    }
}

async function cargarProductos() {
    const data = await queryPG("SELECT * FROM productos ORDER BY id_producto");
    const div = document.getElementById('productosLista');
    if (data && data.length) {
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
}

async function cargarPedidos() {
    const data = await queryPG(`
        SELECT p.id_pedido, c.nombre, p.total, p.fecha_pedido, p.estado 
        FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente 
        ORDER BY p.fecha_pedido DESC LIMIT 20
    `);
    const div = document.getElementById('pedidosLista');
    if (data && data.length) {
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
                        <td style="padding:10px;">${p.estado}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    } else {
        div.innerHTML = '<p style="text-align:center;color:#666;">Sin pedidos</p>';
    }
}

async function cargarClientes() {
    const data = await queryPG("SELECT id_cliente, nombre, email, telefono FROM clientes ORDER BY id_cliente LIMIT 20");
    const div = document.getElementById('clientesLista');
    if (data && data.length) {
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
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.tab + 'Content').classList.add('active');
        if (this.dataset.tab === 'resumen') cargarResumen();
        else if (this.dataset.tab === 'productos') cargarProductos();
        else if (this.dataset.tab === 'pedidos') cargarPedidos();
        else if (this.dataset.tab === 'clientes') cargarClientes();
    });
});

document.addEventListener('DOMContentLoaded', cargarResumen);