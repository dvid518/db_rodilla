export function actualizarHeader() {
    const userId = localStorage.getItem('userId');
    const nav = document.querySelector('.nav');
    if (!nav) return;

    nav.innerHTML = '';

    const catalogoLink = document.createElement('a');
    catalogoLink.href = 'catalogo.html';
    catalogoLink.className = 'link';
    catalogoLink.textContent = 'Catálogo';
    nav.appendChild(catalogoLink);

    const carritoLink = document.createElement('a');
    carritoLink.href = 'carrito.html';
    carritoLink.className = 'link';
    carritoLink.textContent = 'Carrito';
    nav.appendChild(carritoLink);

    if (userId) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.innerHTML = `
            <button class="btn-cuenta">
                👤 Mi Cuenta
                ▼
            </button>
            <div class="dropdown-menu">
                <a href="mi_cuenta.html" class="dropdown-item">Ver estado</a>
                <a href="#" class="dropdown-item salir" onclick="window.cerrarSesion()">Cerrar Sesión</a>
            </div>
        `;
        nav.appendChild(dropdown);
        document.querySelector('.btn-cuenta')?.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelector('.dropdown-menu')?.classList.toggle('show');
        });
    } else {
        const loginBtn = document.createElement('a');
        loginBtn.href = 'login.html';
        loginBtn.className = 'btn btn-primary';
        loginBtn.textContent = 'Iniciar Sesión';
        nav.appendChild(loginBtn);
    }
}

window.cerrarSesion = function() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = 'catalogo.html';
};

document.addEventListener('DOMContentLoaded', actualizarHeader);