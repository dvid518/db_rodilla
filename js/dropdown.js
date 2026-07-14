document.querySelector('.btn-cuenta')?.addEventListener('click', function() {
    const menu = document.querySelector('.dropdown-menu');
    if (menu) menu.classList.toggle('show');
});
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelector('.dropdown-menu')?.classList.remove('show');
    }
});