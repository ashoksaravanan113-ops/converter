document.addEventListener('DOMContentLoaded', function () {

    const navbar = document.getElementById('mainNavbar');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item');

    // Shrink + deepen shadow on scroll
    function handleScroll() {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Auto-close mobile menu when a link is tapped
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navMenu)
                    || new bootstrap.Collapse(navMenu, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

});