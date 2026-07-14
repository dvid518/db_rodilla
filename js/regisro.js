import { API_URL } from './config.js';

document.getElementById('registroForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;

    if (!nombre || !email || !password) {
        alert('Nombre, email y contraseña son obligatorios');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, telefono, password })
        });
        const data = await res.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        alert('Cuenta creada correctamente');
        localStorage.setItem('userId', data.id_cliente);
        localStorage.setItem('userName', data.nombre);
        window.location.href = 'catalogo.html';
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Error de conexión');
    }
});