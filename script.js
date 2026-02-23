/* ══════════════════════════════════════════════════════════
   LAETUS SOLIS — SCRIPT.JS
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Lucide icons ──────────────────────────────────────── */
    if (typeof lucide !== 'undefined') lucide.createIcons();

    /* ── Header: scroll effect ─────────────────────────────── */
    const header = document.getElementById('header');

    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ── Hero background: fade-in after load ───────────────── */
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        const bgUrl = heroBg.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
        const tempImg = new Image();
        tempImg.onload = () => heroBg.classList.add('loaded');
        tempImg.src = bgUrl;
    }

    /* ── Scroll Reveal ─────────────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger siblings in the same parent grid/flex
                const siblings = [...entry.target.parentElement.children].filter(
                    el => el.classList.contains('reveal') && !el.classList.contains('visible')
                );
                siblings.forEach((sib, i) => {
                    setTimeout(() => sib.classList.add('visible'), i * 90);
                });
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ── Mobile Drawer ─────────────────────────────────────── */
    const burger       = document.getElementById('burger');
    const drawer       = document.getElementById('drawer');
    const drawerClose  = document.getElementById('drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');

    function openDrawer() {
        drawer.classList.add('open');
        drawerOverlay.classList.add('visible');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    window.closeDrawer = function () {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('visible');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (burger)      burger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

    /* ── CARROSSEL ─────────────────────────────────────────── */
    const track    = document.getElementById('carousel-track');
    const viewport = document.getElementById('carousel-viewport');
    const prevBtn  = document.getElementById('car-prev');
    const nextBtn  = document.getElementById('car-next');
    const dotsWrap = document.getElementById('carousel-dots');

    if (track && viewport) {
        const cards = [...track.querySelectorAll('.prof-card')];
        let currentIndex = 0;

        /* Quantos cards visíveis por viewport */
        function getVisible() {
            const vw = window.innerWidth;
            if (vw <= 600)  return 1;
            if (vw <= 900)  return 2;
            if (vw <= 1100) return 3;
            return 4;
        }

        /* Total de "páginas" */
        function getTotal() {
            return Math.ceil(cards.length / getVisible());
        }

        /* Largura de um card + gap */
        function getCardWidth() {
            if (!cards[0]) return 0;
            const style   = getComputedStyle(track);
            const gap     = parseFloat(style.gap) || 24;
            return cards[0].getBoundingClientRect().width + gap;
        }

        /* Criar dots */
        function buildDots() {
            dotsWrap.innerHTML = '';
            const total = getTotal();
            for (let i = 0; i < total; i++) {
                const btn = document.createElement('button');
                btn.className = 'dot' + (i === 0 ? ' active' : '');
                btn.setAttribute('aria-label', `Página ${i + 1}`);
                btn.addEventListener('click', () => goTo(i * getVisible()));
                dotsWrap.appendChild(btn);
            }
        }

        /* Atualizar dots */
        function updateDots() {
            const pageIndex = Math.round(currentIndex / getVisible());
            [...dotsWrap.querySelectorAll('.dot')].forEach((dot, i) => {
                dot.classList.toggle('active', i === pageIndex);
            });
        }

        /* Atualizar botões */
        function updateButtons() {
            const max = cards.length - getVisible();
            prevBtn.disabled = currentIndex <= 0;
            nextBtn.disabled = currentIndex >= max;
        }

        /* Ir para índice */
        function goTo(index) {
            const max = Math.max(0, cards.length - getVisible());
            currentIndex = Math.max(0, Math.min(index, max));
            track.style.transform = `translateX(-${getCardWidth() * currentIndex}px)`;
            updateButtons();
            updateDots();
        }

        prevBtn.addEventListener('click', () => goTo(currentIndex - getVisible()));
        nextBtn.addEventListener('click', () => goTo(currentIndex + getVisible()));

        /* ── Touch / Swipe (iPhone) ────────────────────────── */
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging  = false;
        let startTranslate = 0;
        let diffX = 0;

        function getCurrentTranslate() {
            return getCardWidth() * currentIndex;
        }

        viewport.addEventListener('touchstart', (e) => {
            touchStartX     = e.touches[0].clientX;
            touchStartY     = e.touches[0].clientY;
            startTranslate  = getCurrentTranslate();
            isDragging      = false;
            track.style.transition = 'none';
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            diffX = touchStartX - e.touches[0].clientX;
            const diffY = touchStartY - e.touches[0].clientY;

            // só arrastar horizontalmente (evita conflito com scroll vertical)
            if (!isDragging && Math.abs(diffX) < Math.abs(diffY)) return;
            isDragging = true;

            e.preventDefault();
            const drag = startTranslate + diffX;
            track.style.transform = `translateX(${-drag}px)`;
        }, { passive: false });

        viewport.addEventListener('touchend', () => {
            track.style.transition = '';
            if (!isDragging) return;

            const threshold = viewport.offsetWidth * 0.2;
            if (diffX > threshold) {
                goTo(currentIndex + getVisible());
            } else if (diffX < -threshold) {
                goTo(currentIndex - getVisible());
            } else {
                goTo(currentIndex); // snap back
            }
            isDragging = false;
            diffX = 0;
        }, { passive: true });

        /* ── Mouse drag (desktop) ──────────────────────────── */
        let mouseDown  = false;
        let mouseStartX = 0;
        let mouseDiffX  = 0;

        viewport.addEventListener('mousedown', (e) => {
            mouseDown   = true;
            mouseStartX = e.clientX;
            mouseDiffX  = 0;
            startTranslate = getCurrentTranslate();
            track.style.transition = 'none';
            viewport.classList.add('dragging');
        });
        window.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            mouseDiffX = mouseStartX - e.clientX;
            track.style.transform = `translateX(${-(startTranslate + mouseDiffX)}px)`;
        });
        window.addEventListener('mouseup', () => {
            if (!mouseDown) return;
            mouseDown = false;
            viewport.classList.remove('dragging');
            track.style.transition = '';
            const threshold = viewport.offsetWidth * 0.15;
            if (mouseDiffX > threshold)       goTo(currentIndex + getVisible());
            else if (mouseDiffX < -threshold) goTo(currentIndex - getVisible());
            else                              goTo(currentIndex);
        });

        /* ── Auto-play ─────────────────────────────────────── */
        let autoTimer;
        function startAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => {
                const max = cards.length - getVisible();
                goTo(currentIndex >= max ? 0 : currentIndex + getVisible());
            }, 4000);
        }
        function stopAuto() { clearInterval(autoTimer); }

        viewport.addEventListener('mouseenter', stopAuto);
        viewport.addEventListener('mouseleave', startAuto);
        viewport.addEventListener('touchstart', stopAuto, { passive: true });
        viewport.addEventListener('touchend',   startAuto, { passive: true });

        /* ── Rebuild on resize ─────────────────────────────── */
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                buildDots();
                goTo(0);
            }, 200);
        });

        /* ── Init ──────────────────────────────────────────── */
        buildDots();
        goTo(0);
        startAuto();
    }

    /* ── Formulário ────────────────────────────────────────── */
    const form = document.getElementById('form-contato');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit');
            const original = btn.textContent;

            btn.textContent = '✓ Mensagem enviada!';
            btn.classList.add('sent');
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('sent');
                btn.disabled = false;
                form.reset();
            }, 3500);
        });
    }

    /* ── Links âncora: fechar drawer em mobile ─────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeDrawer();
        });
    });

});