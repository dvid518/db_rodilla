import { API_URL } from './config.js';

document.getElementById('registroForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('registroError');

    if (errorDiv) errorDiv.textContent = '';

    if (!nombre || !email || !password) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Nombre, email y contraseña son obligatorios';
            errorDiv.style.color = '#F4A7BB';
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
    }

    try {
        const res = await fetch(`${API_URL}/api/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, telefono, password })
        });

        const data = await res.json();

        if (data.error) {
            if (errorDiv) {
                errorDiv.textContent = '❌ ' + data.error;
                errorDiv.style.color = '#F4A7BB';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear Cuenta';
            }
            return;
        }

        alert('Cuenta creada correctamente');
        localStorage.setItem('userId', data.id_cliente);
        localStorage.setItem('userName', data.nombre);
        window.location.href = 'catalogo.html';

    } catch (error) {
        console.error('Error en registro:', error);
        if (errorDiv) {
            errorDiv.textContent = '❌ Error de conexión con el servidor';
            errorDiv.style.color = '#F4A7BB';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    }
});