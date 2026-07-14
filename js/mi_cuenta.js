import { API_URL } from './config.js';

async function cargarPerfil() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // 1. Datos del perfil
        const perfilRes = await fetch(`${API_URL}/api/perfil/${userId}`);
        const perfil = await perfilRes.json();
        if (perfil.error) {
            console.error(perfil.error);
            return;
        }
        document.getElementById('nombre').textContent = perfil.nombre || 'Usuario';
        document.getElementById('email').textContent = perfil.email || '-';
        document.getElementById('telefono').textContent = perfil.telefono || '-';
        document.getElementById('fecha').textContent = perfil.fecha_registro ? new Date(perfil.fecha_registro).toLocaleDateString() : '-';

        // 2. Pedidos del cliente
        const pedidosRes = await fetch(`${API_URL}/api/mis-pedidos/${userId}`);
        const pedidos = await pedidosRes.json();
        const container = document.getElementById('pedidos');
        const nop = document.getElementById('nop');
        if (pedidos && pedidos.length > 0) {
            nop.style.display = 'none';
            container.style.display = 'flex';
            container.innerHTML = pedidos.map(p => `
                <div class="pedido-item">
                    <span>#${p.id_pedido}</span>
                    <span>${new Date(p.fecha_pedido).toLocaleDateString()}</span>
                    <span>S/ ${parseFloat(p.total).toFixed(2)}</span>
                </div>
            `).join('');
        } else {
            nop.style.display = 'block';
            container.style.display = 'none';
        }

        // 3. Comentarios del cliente
        const comentariosRes = await fetch(`${API_URL}/api/mis-comentarios/${userId}`);
        const comentarios = await comentariosRes.json();
        const lista = document.getElementById('listaComentarios');
        const noCom = document.getElementById('noComentarios');
        if (comentarios && comentarios.length > 0) {
            noCom.style.display = 'none';
            lista.innerHTML = comentarios.map(c => `
                <div class="comentario-item">
                    <p>${c.texto}</p>
                    <small>${c.fecha ? new Date(c.fecha).toLocaleDateString() : ''}</small>
                </div>
            `).join('');
        } else {
            noCom.style.display = 'block';
            lista.innerHTML = '';
        }

        // 4. Preferencias del cliente
        const prefsRes = await fetch(`${API_URL}/api/mis-preferencias/${userId}`);
        const preferencias = await prefsRes.json();
        if (preferencias && !preferencias.error) {
            document.getElementById('idioma').value = preferencias.idioma || 'es';
            document.getElementById('metodoPago').value = preferencias.metodo_pago || '';
            if (preferencias.notificaciones) {
                document.getElementById('notifEmail').checked = preferencias.notificaciones.email || false;
                document.getElementById('notifSMS').checked = preferencias.notificaciones.sms || false;
                document.getElementById('notifPromo').checked = preferencias.notificaciones.promo || false;
            }
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
        alert('Error al cargar los datos del perfil');
    }
}

// Guardar preferencias
document.getElementById('formPreferencias')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const preferencias = {
        idioma: document.getElementById('idioma').value,
        metodo_pago: document.getElementById('metodoPago').value,
        notificaciones: {
            email: document.getElementById('notifEmail').checked,
            sms: document.getElementById('notifSMS').checked,
            promo: document.getElementById('notifPromo').checked
        }
    };

    try {
        const res = await fetch(`${API_URL}/api/preferencias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cliente: parseInt(userId),
                preferencias
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('Preferencias guardadas correctamente');
        } else {
            alert('Error al guardar preferencias');
        }
    } catch (error) {
        console.error('Error guardando preferencias:', error);
        alert('Error de conexión');
    }
});

// Agregar comentario
document.getElementById('formComentario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const texto = document.getElementById('nuevoComentario').value.trim();
    if (!texto) {
        alert('Escribe un comentario');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/comentario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cliente: parseInt(userId),
                texto
            })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('nuevoComentario').value = '';
            cargarPerfil(); // Recargar comentarios
        } else {
            alert('Error al agregar comentario');
        }
    } catch (error) {
        console.error('Error agregando comentario:', error);
        alert('Error de conexión');
    }
});

document.addEventListener('DOMContentLoaded', cargarPerfil);