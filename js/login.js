import { API_URL } from './config.js';

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (emailError) emailError.textContent = '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';
    }

    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.status === 404 && data.redirect) {
            if (emailError) {
                emailError.textContent = '✉️ El correo no está registrado. Redirigiendo a registro...';
                emailError.style.color = '#88B04B';
            }
            setTimeout(() => {
                window.location.href = 'registro.html';
            }, 1500);
            return;
        }

        if (data.error) {
            if (emailError) {
                emailError.textContent = '❌ ' + data.error;
                emailError.style.color = '#F4A7BB';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesión';
            }
            return;
        }

        // Login exitoso
        localStorage.setItem('userId', data.id_cliente);
        localStorage.setItem('userName', data.nombre);
        window.location.href = 'catalogo.html';

    } catch (error) {
        console.error('Error en login:', error);
        if (emailError) {
            emailError.textContent = '❌ Error de conexión con el servidor';
            emailError.style.color = '#F4A7BB';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }
});