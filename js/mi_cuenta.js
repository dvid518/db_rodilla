async function cargarPerfil() {
    const id = parseInt(localStorage.getItem('userId')) || 1;
    const sql = `SELECT nombre, email, telefono, fecha_registro FROM clientes WHERE id_cliente = ${id}`;
    const data = await queryPG(sql);
    if (data && data.length) {
        document.getElementById('nombre').textContent = data[0].nombre;
        document.getElementById('email').textContent = data[0].email;
        document.getElementById('telefono').textContent = data[0].telefono || '-';
        document.getElementById('fecha').textContent = new Date(data[0].fecha_registro).toLocaleDateString();
    }
    const pedidosSql = `SELECT id_pedido, fecha_pedido, total FROM pedidos WHERE id_cliente = ${id} ORDER BY fecha_pedido DESC`;
    const pedidos = await queryPG(pedidosSql);
    const container = document.getElementById('pedidos');
    const nop = document.getElementById('nop');
    if (pedidos && pedidos.length) {
        nop.style.display = 'none';
        container.style.display = 'flex';
        container.innerHTML = pedidos.map(p => `
            <div class="pedido-item">
                <span>#${p.id_pedido}</span>
                <span>${new Date(p.fecha_pedido).toLocaleDateString()}</span>
                <span>S/ ${parseFloat(p.total).toFixed(2)}</span>
            </div>
        `).join('');
    }
    const mongoData = await findMongo({ id_cliente: id });
    if (mongoData && mongoData.documents && mongoData.documents.length) {
        const doc = mongoData.documents[0];
        if (doc.comentarios) {
            const lista = document.getElementById('listaComentarios');
            const noCom = document.getElementById('noComentarios');
            if (doc.comentarios.length) {
                noCom.style.display = 'none';
                lista.innerHTML = doc.comentarios.map(c => `
                    <div class="comentario-item">
                        <p>${c.texto}</p>
                        <small>${new Date(c.fecha).toLocaleDateString()}</small>
                    </div>
                `).join('');
            }
        }
    }
}

document.getElementById('formComentario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(localStorage.getItem('userId')) || 1;
    const texto = document.getElementById('nuevoComentario').value.trim();
    if (!texto) return alert('Escribe un comentario');
    const doc = await findMongo({ id_cliente: id });
    if (doc && doc.documents && doc.documents.length) {
        const existing = doc.documents[0];
        const comentarios = existing.comentarios || [];
        comentarios.push({ texto, fecha: new Date().toISOString() });
        await updateMongo({ id_cliente: id }, { $set: { comentarios } });
    } else {
        await insertMongo({ id_cliente: id, comentarios: [{ texto, fecha: new Date().toISOString() }] });
    }
    document.getElementById('nuevoComentario').value = '';
    cargarPerfil();
});

document.getElementById('formPreferencias')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(localStorage.getItem('userId')) || 1;
    const preferencias = {
        idioma: document.getElementById('idioma').value,
        metodo_pago: document.getElementById('metodoPago').value,
        notificaciones: {
            email: document.getElementById('notifEmail').checked,
            sms: document.getElementById('notifSMS').checked,
            promo: document.getElementById('notifPromo').checked
        }
    };
    const doc = await findMongo({ id_cliente: id });
    if (doc && doc.documents && doc.documents.length) {
        await updateMongo({ id_cliente: id }, { $set: { preferencias } });
    } else {
        await insertMongo({ id_cliente: id, preferencias });
    }
    alert('Preferencias guardadas');
});

document.addEventListener('DOMContentLoaded', cargarPerfil);