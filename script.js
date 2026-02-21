// Inicializar Ícones Lucide
lucide.createIcons();

// --- CONTROLE DO MENU MOBILE ---
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-overlay a');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// --- EFEITO SCROLL NO HEADER ---
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- ANIMAÇÃO DE REVELAÇÃO NO SCROLL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

const hiddenElements = document.querySelectorAll('.hidden, .hidden-left, .hidden-right, .hidden-up');
hiddenElements.forEach((el) => observer.observe(el));

// --- SIMULAÇÃO DE ENVIO DE FORMULÁRIO ---
const form = document.getElementById('form-contato');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
    form.reset();
});

// Delay em cascata para cards de serviço e profissionais
document.querySelectorAll('.service-card, .prof-card').forEach((card, index) => {
    card.style.transitionDelay = `${(index % 4) * 0.15}s`;
});