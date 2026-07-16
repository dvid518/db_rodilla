export function actualizarHeader() {
    const userId = localStorage.getItem('userId');
    const nav = document.querySelector('.nav');
    if (!nav) return;

    nav.innerHTML = '';

    // 1. Enlace Catálogo
    const catalogoLink = document.createElement('a');
    catalogoLink.href = 'catalogo.html';
    catalogoLink.className = 'link';
    catalogoLink.textContent = '🏠 Catálogo';
    nav.appendChild(catalogoLink);

    // 2. Enlace Carrito
    const carritoLink = document.createElement('a');
    carritoLink.href = 'carrito.html';
    carritoLink.className = 'link';
    carritoLink.textContent = '🛒 Carrito';
    nav.appendChild(carritoLink);

    if (userId) {
        // 3. Usuario logueado - Dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.innerHTML = `
            <button class="btn-cuenta">
                👤 ${localStorage.getItem('userName') || 'Mi Cuenta'}
                <span style="font-size:12px;margin-left:4px;">▼</span>
            </button>
            <div class="dropdown-menu">
                <a href="mi_cuenta.html" class="dropdown-item">📋 Ver estado</a>
                <a href="#" class="dropdown-item salir" onclick="window.cerrarSesion()">🚪 Cerrar Sesión</a>
            </div>
        `;
        nav.appendChild(dropdown);

        // Evento del dropdown
        dropdown.querySelector('.btn-cuenta')?.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = dropdown.querySelector('.dropdown-menu');
            menu.classList.toggle('show');
        });

    } else {
        // 4. Usuario no logueado
        const loginBtn = document.createElement('a');
        loginBtn.href = 'login.html';
        loginBtn.className = 'btn btn-primary';
        loginBtn.textContent = '🔑 Iniciar Sesión';
        nav.appendChild(loginBtn);
    }
}

window.cerrarSesion = function() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = 'catalogo.html';
};

document.addEventListener('DOMContentLoaded', actualizarHeader);