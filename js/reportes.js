async function cargarResumenGeneral() {
    const stats = document.getElementById('statsGeneral');
    const ingresos = await queryPG("SELECT COALESCE(SUM(total), 0) as total FROM pedidos");
    const pedidos = await queryPG("SELECT COUNT(*) as count FROM pedidos");
    const clientes = await queryPG("SELECT COUNT(*) as count FROM clientes");
    const productos = await queryPG("SELECT COUNT(*) as count FROM productos");
    const mongoTotal = await findMongo({});
    const totalComentarios = mongoTotal.documents ? mongoTotal.documents.reduce((acc, d) => acc + (d.comentarios ? d.comentarios.length : 0), 0) : 0;
    stats.innerHTML = `
        <div class="stat-box"><h4>Ingresos</h4><p>S/ ${parseFloat(ingresos[0]?.total || 0).toFixed(2)}</p></div>
        <div class="stat-box"><h4>Pedidos</h4><p>${pedidos[0]?.count || 0}</p></div>
        <div class="stat-box"><h4>Clientes</h4><p>${clientes[0]?.count || 0}</p></div>
        <div class="stat-box"><h4>Productos</h4><p>${productos[0]?.count || 0}</p></div>
        <div class="stat-box"><h4>Comentarios</h4><p>${totalComentarios}</p></div>
    `;
}

async function cargarClientesIntegrados() {
    const div = document.getElementById('clientesLista');
    const clientes = await queryPG("SELECT id_cliente, nombre, email, telefono FROM clientes ORDER BY id_cliente LIMIT 20");
    if (!clientes || !clientes.length) {
        div.innerHTML = '<p style="text-align:center;color:#888;">Sin clientes</p>';
        return;
    }
    div.innerHTML = `
        <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#f5f5f5;">
                <th style="padding:10px;text-align:left;">ID</th>
                <th style="padding:10px;text-align:left;">Nombre</th>
                <th style="padding:10px;text-align:left;">Email</th>
                <th style="padding:10px;text-align:left;">Comentarios</th>
                <th style="padding:10px;text-align:left;">Acción</th>
            </tr>
            ${clientes.map(c => `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px;">${c.id_cliente}</td>
                    <td style="padding:10px;">${c.nombre}</td>
                    <td style="padding:10px;">${c.email}</td>
                    <td style="padding:10px;" id="comentarios_${c.id_cliente}">Cargando...</td>
                    <td style="padding:10px;"><button onclick="verCliente(${c.id_cliente})">Ver</button></td>
                </tr>
            `).join('')}
        </table>
    `;
    for (const c of clientes) {
        const mongo = await findMongo({ id_cliente: c.id_cliente });
        const count = mongo.documents && mongo.documents.length ? (mongo.documents[0].comentarios ? mongo.documents[0].comentarios.length : 0) : 0;
        document.getElementById(`comentarios_${c.id_cliente}`).textContent = count;
    }
}

async function verCliente(id) {
    const mongo = await findMongo({ id_cliente: id });
    const pg = await queryPG(`SELECT id_cliente, nombre, email, telefono FROM clientes WHERE id_cliente = ${id}`);
    if (pg && pg.length) {
        document.getElementById('mcId').textContent = pg[0].id_cliente;
        document.getElementById('mcNombre').textContent = pg[0].nombre;
        document.getElementById('mcEmail').textContent = pg[0].email;
        document.getElementById('mcTelefono').textContent = pg[0].telefono || '-';
        document.getElementById('mcDireccion').textContent = '-';
    }
    const prefs = document.getElementById('boxPreferencias');
    const comentariosDiv = document.getElementById('listaComentariosMongo');
    if (mongo.documents && mongo.documents.length) {
        const doc = mongo.documents[0];
        if (doc.preferencias) {
            prefs.innerHTML = `
                <p><strong>Idioma:</strong> ${doc.preferencias.idioma || 'No especificado'}</p>
                <p><strong>Método de pago:</strong> ${doc.preferencias.metodo_pago || 'No especificado'}</p>
                <p><strong>Notificaciones:</strong> ${doc.preferencias.notificaciones ? 'Email: ' + (doc.preferencias.notificaciones.email ? '✓' : '✗') : 'No configurado'}</p>
            `;
        } else {
            prefs.innerHTML = '<p style="color:#999;">Sin preferencias</p>';
        }
        if (doc.comentarios && doc.comentarios.length) {
            comentariosDiv.innerHTML = doc.comentarios.map(c => `
                <div style="padding:8px;border-bottom:1px solid #eee;">
                    <p>${c.texto}</p>
                    <small>${new Date(c.fecha).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            comentariosDiv.innerHTML = '<p style="color:#999;">Sin comentarios</p>';
        }
    } else {
        prefs.innerHTML = '<p style="color:#999;">Sin datos en MongoDB</p>';
        comentariosDiv.innerHTML = '<p style="color:#999;">Sin comentarios</p>';
    }
    document.getElementById('modalCliente').style.display = 'flex';
}

function cerrarModalCliente() {
    document.getElementById('modalCliente').style.display = 'none';
}