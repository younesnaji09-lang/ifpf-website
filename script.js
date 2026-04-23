/* ==========================================================================
   IFPF - Institut de Formation Professionnelle de France
   Script principal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ======================================================================
    // 1. MENU MOBILE (BURGER)
    // ======================================================================
    const burger = document.querySelector('.burger');
    const navPrincipal = document.querySelector('.nav-principal');
    const menuItems = document.querySelectorAll('.menu-item');

    if (burger && navPrincipal) {
        burger.addEventListener('click', function() {
            this.classList.toggle('active');
            navPrincipal.classList.toggle('active');
            document.body.style.overflow = navPrincipal.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Ouverture des sous-menus en mobile
    menuItems.forEach(item => {
        const lien = item.querySelector('.menu-lien');
        const sousMenu = item.querySelector('.sous-menu');

        if (sousMenu && lien) {
            lien.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    // Fermer les autres
                    menuItems.forEach(autre => {
                        if (autre !== item) autre.classList.remove('ouvert');
                    });
                    item.classList.toggle('ouvert');
                }
            });
        }
    });

    // Fermer le menu en cliquant sur un lien
    document.querySelectorAll('.sous-menu-lien').forEach(lien => {
        lien.addEventListener('click', function() {
            if (window.innerWidth <= 900) {
                burger?.classList.remove('active');
                navPrincipal?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ======================================================================
    // 2. SCROLL DE L'EN-TÊTE
    // ======================================================================
    const entete = document.querySelector('.entete');
    let dernierScroll = 0;

    window.addEventListener('scroll', function() {
        const scrollActuel = window.pageYOffset;

        if (scrollActuel > 20) {
            entete?.classList.add('scrolled');
        } else {
            entete?.classList.remove('scrolled');
        }

        dernierScroll = scrollActuel;
    });

    // ======================================================================
    // 3. CARROUSEL DE TÉMOIGNAGES
    // ======================================================================
    const temoignages = document.querySelectorAll('.temoignage');
    const dots = document.querySelectorAll('.carrousel-dot');
    let indexCourant = 0;
    let intervalleCarrousel = null;

    function afficherTemoignage(index) {
        temoignages.forEach(t => t.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        if (temoignages[index]) {
            temoignages[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function temoignageSuivant() {
        indexCourant = (indexCourant + 1) % temoignages.length;
        afficherTemoignage(indexCourant);
    }

    function demarrerCarrousel() {
        if (temoignages.length > 1) {
            intervalleCarrousel = setInterval(temoignageSuivant, 6000);
        }
    }

    function arreterCarrousel() {
        if (intervalleCarrousel) {
            clearInterval(intervalleCarrousel);
            intervalleCarrousel = null;
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            arreterCarrousel();
            indexCourant = index;
            afficherTemoignage(indexCourant);
            demarrerCarrousel();
        });
    });

    demarrerCarrousel();

    // ======================================================================
    // 4. ANIMATION AU SCROLL
    // ======================================================================
    const elementsAAnimer = document.querySelectorAll('.animer');

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsAAnimer.forEach(el => observer.observe(el));

    // ======================================================================
    // 5. COMPTEURS ANIMÉS DES STATISTIQUES
    // ======================================================================
    const compteurs = document.querySelectorAll('.stat-nombre[data-cible]');

    function animerCompteur(el) {
        const cible = parseInt(el.dataset.cible);
        const suffixe = el.dataset.suffixe || '';
        const duree = 2000;
        const debut = performance.now();

        function animer(timestamp) {
            const progression = Math.min((timestamp - debut) / duree, 1);
            // Easing facile (easeOutQuart)
            const ease = 1 - Math.pow(1 - progression, 4);
            const valeur = Math.floor(ease * cible);
            el.textContent = valeur + suffixe;

            if (progression < 1) {
                requestAnimationFrame(animer);
            }
        }

        requestAnimationFrame(animer);
    }

    const observerCompteurs = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animerCompteur(entry.target);
                observerCompteurs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    compteurs.forEach(c => observerCompteurs.observe(c));

    // ======================================================================
    // 6. SCROLL FLUIDE SUR LES ANCRES INTERNES
    // ======================================================================
    document.querySelectorAll('a[href^="#"]').forEach(lien => {
        lien.addEventListener('click', function(e) {
            const cible = this.getAttribute('href');
            if (cible === '#' || cible.length < 2) return;

            const element = document.querySelector(cible);
            if (element) {
                e.preventDefault();
                const hauteurEntete = entete?.offsetHeight || 80;
                const positionCible = element.getBoundingClientRect().top + window.pageYOffset - hauteurEntete;
                window.scrollTo({
                    top: positionCible,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ======================================================================
    // 7. FORMULAIRES - VALIDATION DE BASE
    // ======================================================================
    const formulaires = document.querySelectorAll('.formulaire-avec-validation');

    formulaires.forEach(formulaire => {
        formulaire.addEventListener('submit', function(e) {
            e.preventDefault();

            const champsRequis = this.querySelectorAll('[required]');
            let valide = true;

            champsRequis.forEach(champ => {
                if (!champ.value.trim()) {
                    champ.style.borderColor = 'var(--rouge-france)';
                    valide = false;
                } else {
                    champ.style.borderColor = '';
                }
            });

            if (valide) {
                const bouton = this.querySelector('button[type="submit"]');
                if (bouton) {
                    const texteOriginal = bouton.textContent;
                    bouton.textContent = 'Envoi en cours...';
                    bouton.disabled = true;

                    setTimeout(() => {
                        alert('Merci ! Votre message a bien été envoyé. Nous reviendrons vers vous rapidement.');
                        this.reset();
                        bouton.textContent = texteOriginal;
                        bouton.disabled = false;
                    }, 1000);
                }
            } else {
                alert('Merci de remplir tous les champs obligatoires.');
            }
        });
    });

    // ======================================================================
    // 8. FERMETURE DU MENU MOBILE AU CLIC EXTÉRIEUR
    // ======================================================================
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 900 &&
            navPrincipal?.classList.contains('active') &&
            !navPrincipal.contains(e.target) &&
            !burger?.contains(e.target)) {
            burger?.classList.remove('active');
            navPrincipal?.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ======================================================================
    // 9. GESTION DU REDIMENSIONNEMENT
    // ======================================================================
    let timeoutRedim;
    window.addEventListener('resize', function() {
        clearTimeout(timeoutRedim);
        timeoutRedim = setTimeout(() => {
            if (window.innerWidth > 900) {
                burger?.classList.remove('active');
                navPrincipal?.classList.remove('active');
                document.body.style.overflow = '';
                menuItems.forEach(item => item.classList.remove('ouvert'));
            }
        }, 150);
    });

    console.log('%cIFPF - Institut de Formation Professionnelle de France', 'color: #0055A4; font-size: 18px; font-weight: bold;');
    console.log('%c🇫🇷 Site initialisé avec succès', 'color: #EF4135; font-size: 14px;');
});
