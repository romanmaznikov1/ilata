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

    drawer.querySelectorAll('a').forEach(link => {
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

    /* ---------- Phone input masking ---------- */
    const phoneInput = document.getElementById('fPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
            let formatted = '';
            if (digits.length === 0) {
                formatted = '';
            } else {
                const d = digits.startsWith('7') || digits.startsWith('8') ? digits : '7' + digits;
                const trimmed = d.slice(0, 11);
                formatted = '+7';
                if (trimmed.length > 1) formatted += ' (' + trimmed.slice(1, 4);
                if (trimmed.length >= 4) formatted += ') ' + trimmed.slice(4, 7);
                if (trimmed.length >= 7) formatted += '-' + trimmed.slice(7, 9);
                if (trimmed.length >= 9) formatted += '-' + trimmed.slice(9, 11);
            }
            e.target.value = formatted;
        });
    }

    /* ---------- Form submit ---------- */
    const form = document.getElementById('bookingForm');
    const success = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let valid = true;
            const nameField = form.querySelector('#fName').closest('.field');
            const phoneField = form.querySelector('#fPhone').closest('.field');

            const nameVal = form.querySelector('#fName').value.trim();
            const phoneVal = form.querySelector('#fPhone').value.replace(/\D/g, '');

            if (nameVal.length < 2) {
                nameField.classList.add('has-error');
                nameField.querySelector('[data-error]').textContent = 'Введите имя — минимум 2 символа';
                valid = false;
            } else {
                nameField.classList.remove('has-error');
                nameField.querySelector('[data-error]').textContent = '';
            }

            if (phoneVal.length < 11) {
                phoneField.classList.add('has-error');
                phoneField.querySelector('[data-error]').textContent = 'Введите корректный номер телефона';
                valid = false;
            } else {
                phoneField.classList.remove('has-error');
                phoneField.querySelector('[data-error]').textContent = '';
            }

            if (!valid) return;

            // Simulate submit
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.querySelector('.btn-text').textContent;
            btn.querySelector('.btn-text').textContent = 'Отправляем…';
            btn.disabled = true;

            setTimeout(() => {
                success.hidden = false;
                form.querySelectorAll('input').forEach(i => { if (i.type !== 'checkbox') i.value = ''; });
                form.querySelector('#fService').selectedIndex = 0;
                btn.querySelector('.btn-text').textContent = original;
                btn.disabled = false;
            }, 800);
        });

        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                const field = input.closest('.field');
                if (field) {
                    field.classList.remove('has-error');
                    const err = field.querySelector('[data-error]');
                    if (err) err.textContent = '';
                }
            });
        });
    }
})();
