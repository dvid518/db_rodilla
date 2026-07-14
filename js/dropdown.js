document.querySelector('.btn-cuenta')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.dropdown-menu')?.classList.toggle('show');
});

document.addEventListener('click', function() {
    document.querySelector('.dropdown-menu')?.classList.remove('show');
});