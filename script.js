/* ILATA — site interactions */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header scroll state ---------- */
    const header = document.getElementById('siteHeader');
    let lastScroll = 0;
    let rafScrollId = null;

    const onScroll = () => {
        const y = window.scrollY;
        if (y > 16) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
        lastScroll = y;
        rafScrollId = null;
    };

    window.addEventListener('scroll', () => {
        if (rafScrollId === null) rafScrollId = requestAnimationFrame(onScroll);
    }, { passive: true });
    onScroll();

    /* ---------- Mobile drawer ---------- */
    const toggle = document.querySelector('.nav-toggle');
    const drawer = document.getElementById('mobileDrawer');

    const closeDrawer = () => {
        toggle.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeDrawer();
        } else {
            toggle.setAttribute('aria-expanded', 'true');
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    });

    drawer.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion) {
        revealEls.forEach(el => el.classList.add('is-revealed'));
    } else if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.revealDelay || 0;
                    el.style.setProperty('--reveal-delay', `${delay}ms`);
                    el.classList.add('is-revealed');
                    io.unobserve(el);
                }
            });
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.05
        });

        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-revealed'));
    }

    /* ---------- Magnetic buttons ---------- */
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const magnetics = document.querySelectorAll('[data-magnetic]');

        magnetics.forEach(btn => {
            let rafId = null;
            let targetX = 0;
            let targetY = 0;
            let currentX = 0;
            let currentY = 0;

            const animate = () => {
                currentX += (targetX - currentX) * 0.18;
                currentY += (targetY - currentY) * 0.18;
                btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

                if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
                    rafId = requestAnimationFrame(animate);
                } else {
                    btn.style.transform = `translate(${targetX}px, ${targetY}px)`;
                    rafId = null;
                }
            };

            const onMove = (e) => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) * 0.22;
                const dy = (e.clientY - cy) * 0.22;
                targetX = dx;
                targetY = dy;
                if (rafId === null) rafId = requestAnimationFrame(animate);
            };

            const onLeave = () => {
                targetX = 0;
                targetY = 0;
                if (rafId === null) rafId = requestAnimationFrame(animate);
            };

            btn.addEventListener('mousemove', onMove);
            btn.addEventListener('mouseleave', onLeave);
        });
    }

    /* ---------- Price tabs ---------- */
    const tabs = document.querySelectorAll('.price-tab');
    const panels = document.querySelectorAll('.price-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.priceTab;

            tabs.forEach(t => {
                const active = t === tab;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            panels.forEach(panel => {
                panel.classList.toggle('is-active', panel.dataset.pricePanel === target);
            });
        });
    });

    /* ---------- Smooth in-page nav ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.length <= 1) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = 84;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    /* ---------- Booking modal ---------- */
    const bookingModal = document.getElementById('bookingModal');

    if (bookingModal) {
        let lastFocused = null;

        const openBooking = () => {
            lastFocused = document.activeElement;
            bookingModal.classList.add('is-open');
            bookingModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            const first = bookingModal.querySelector('.booking-option, .booking-close');
            if (first) first.focus();
        };

        const closeBooking = () => {
            bookingModal.classList.remove('is-open');
            bookingModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        };

        document.querySelectorAll('[data-booking]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openBooking();
            });
        });

        bookingModal.querySelectorAll('[data-booking-close]').forEach(el => {
            el.addEventListener('click', closeBooking);
        });

        // Close after picking a contact channel
        bookingModal.querySelectorAll('.booking-option').forEach(opt => {
            opt.addEventListener('click', () => setTimeout(closeBooking, 100));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && bookingModal.classList.contains('is-open')) {
                closeBooking();
            }
        });
    }
})();
