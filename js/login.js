document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const users = await queryPG(`SELECT id_cliente, nombre, email FROM clientes WHERE email = '${email}'`);
    if (users && users.length) {
        localStorage.setItem('userId', users[0].id_cliente);
        localStorage.setItem('userName', users[0].nombre);
        window.location.href = 'catalogo.html';
    } else {
        alert('Credenciales incorrectas');
    }
});