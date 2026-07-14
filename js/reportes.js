import { API_URL } from './config.js';

async function cargarResumenGeneral() {
    const stats = document.getElementById('statsGeneral');
    try {
        const res = await fetch(`${API_URL}/api/resumen`);
        const data = await res.json();
        stats.innerHTML = `
            <div class="stat-box"><h4>💰 Ingresos</h4><p>S/ ${parseFloat(data.ingresos || 0).toFixed(2)}</p></div>
            <div class="stat-box"><h4>🧾 Pedidos</h4><p>${data.pedidos || 0}</p></div>
            <div class="stat-box"><h4>👥 Clientes</h4><p>${data.clientes || 0}</p></div>
            <div class="stat-box"><h4>📦 Productos</h4><p>${data.productos || 0}</p></div>
            <div class="stat-box"><h4>💬 Comentarios</h4><p>${data.comentarios || 0}</p></div>
        `;
    } catch (error) {
        console.error('Error cargando resumen:', error);
        stats.innerHTML = '<div class="stat-box"><p style="color:#F4A7BB;">Error al cargar datos</p></div>';
    }
}

async function cargarClientesIntegrados() {
    const div = document.getElementById('clientesLista');
    div.innerHTML = '<p style="text-align:center;color:#888;">Cargando...</p>';
    try {
        const res = await fetch(`${API_URL}/api/clientes-integrado`);
        const data = await res.json();
        if (!data || data.length === 0) {
            div.innerHTML = '<p style="text-align:center;color:#888;">Sin clientes</p>';
            return;
        }
        div.innerHTML = `
            <table style="width:100%;border-collapse:collapse;">
                <tr style="background:#f5f5f5;">
                    <th style="padding:10px;text-align:left;">ID</th>
                    <th style="padding:10px;text-align:left;">Nombre</th>
                    <th style="padding:10px;text-align:left;">Email</th>
                    <th style="padding:10px;text-align:left;">💬 Comentarios</th>
                    <th style="padding:10px;text-align:left;">Acción</th>
                </tr>
                ${data.map(c => `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px;">${c.id_cliente}</td>
                        <td style="padding:10px;">${c.nombre}</td>
                        <td style="padding:10px;">${c.email}</td>
                        <td style="padding:10px;">${c.comentarios_count || 0}</td>
                        <td style="padding:10px;"><button onclick="verCliente(${c.id_cliente})">Ver</button></td>
                    </tr>
                `).join('')}
            </table>
        `;
    } catch (error) {
        console.error('Error cargando clientes integrados:', error);
        div.innerHTML = '<p style="text-align:center;color:#F4A7BB;">Error al cargar clientes</p>';
    }
}

window.verCliente = async function(id) {
    try {
        const res = await fetch(`${API_URL}/api/cliente/${id}`);
        const data = await res.json();
        if (data.error) {
            alert('Error al cargar el cliente');
            return;
        }
        document.getElementById('mcId').textContent = data.id_cliente || '-';
        document.getElementById('mcNombre').textContent = data.nombre || '-';
        document.getElementById('mcEmail').textContent = data.email || '-';
        document.getElementById('mcTelefono').textContent = data.telefono || '-';
        document.getElementById('mcDireccion').textContent = '-';

        const prefs = document.getElementById('boxPreferencias');
        if (data.preferencias) {
            prefs.innerHTML = `
                <p><strong>Idioma:</strong> ${data.preferencias.idioma || 'No especificado'}</p>
                <p><strong>Método de pago:</strong> ${data.preferencias.metodo_pago || 'No especificado'}</p>
            `;
        } else {
            prefs.innerHTML = '<p style="color:#999;">Sin preferencias</p>';
        }

        const comentariosDiv = document.getElementById('listaComentariosMongo');
        if (data.comentarios && data.comentarios.length > 0) {
            comentariosDiv.innerHTML = data.comentarios.map(c => `
                <div style="padding:8px;border-bottom:1px solid #eee;">
                    <p>${c.texto}</p>
                    <small>${c.fecha ? new Date(c.fecha).toLocaleDateString() : ''}</small>
                </div>
            `).join('');
        } else {
            comentariosDiv.innerHTML = '<p style="color:#999;">Sin comentarios</p>';
        }
        document.getElementById('modalCliente').style.display = 'flex';
    } catch (error) {
        console.error('Error cargando cliente:', error);
        alert('Error de conexión');
    }
};

window.cerrarModalCliente = function() {
    document.getElementById('modalCliente').style.display = 'none';
};

// Cargar resumen automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', cargarResumenGeneral);