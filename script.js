document.addEventListener('DOMContentLoaded', () => {
    const btnConsultar = document.getElementById('btn-consultar');
    const cepInput = document.getElementById('cep-input');
    const feedbackDiv = document.getElementById('coverage-feedback');
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-navigation');
    const header = document.querySelector('header');

    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const toggleAutoplayBtn = document.getElementById('toggle-autoplay');

    let currentSlide = 0;
    let autoplay = true;
    let autoplayTimer = null;

    function initLucide() {
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    function updateCarousel(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const active = i === currentSlide;
            slide.classList.toggle('active', active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        dots.forEach((dot, i) => {
            const active = i === currentSlide;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function nextSlide() {
        updateCarousel(currentSlide + 1);
    }

    function prevSlide() {
        updateCarousel(currentSlide - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        if (!autoplay) return;
        autoplayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function toggleAutoplay() {
        autoplay = !autoplay;
        if (toggleAutoplayBtn) {
            toggleAutoplayBtn.setAttribute('aria-pressed', autoplay ? 'false' : 'true');
            toggleAutoplayBtn.setAttribute('aria-label', autoplay ? 'Pausar carrossel' : 'Retomar carrossel');
            toggleAutoplayBtn.innerHTML = autoplay ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
        }
        initLucide();
        if (autoplay) startAutoplay();
        else stopAutoplay();
    }

    function setFeedback(type, html) {
        if (!feedbackDiv) return;
        feedbackDiv.className = 'feedback-message';
        feedbackDiv.innerHTML = html;

        if (type === 'success') feedbackDiv.classList.add('feedback-success');
        if (type === 'error') feedbackDiv.classList.add('feedback-error');

        initLucide();
    }

    function formatCep(value) {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        return digits.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    async function consultarCep(cep) {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('Falha na consulta do CEP');
        return response.json();
    }

    async function verificarCobertura(cepValue) {
        const cep = cepValue.replace(/\D/g, '');

        if (cep.length !== 8) {
            setFeedback('error', 'Por favor, insira um CEP válido contendo 8 dígitos.');
            return;
        }

        setFeedback('success', 'Consultando cobertura, aguarde...');

        try {
            const data = await consultarCep(cep);

            if (data.erro) {
                setFeedback('error', 'CEP não encontrado. Verifique o número informado.');
                return;
            }

            setFeedback(
                'success',
                `
          <div><strong>Ótima notícia!</strong> Temos ultravelocidade disponível na sua região.</div>
          <a href="https://wa.me/5581988776032?text=Olá! Consultei meu CEP (${cepInput ? cepInput.value : ''}) no site e vi que há disponibilidade de cobertura. Quero contratar!"
             target="_blank"
             rel="noopener noreferrer"
             class="btn-whatsapp-redirect">
             <i data-lucide="message-square"></i> Falar com Atendente
          </a>
        `
            );
        } catch (error) {
            setFeedback('error', 'Não foi possível consultar o CEP agora. Tente novamente em instantes.');
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateCarousel(index);
            startAutoplay();
        });
    });

    if (toggleAutoplayBtn) {
        toggleAutoplayBtn.addEventListener('click', toggleAutoplay);
    }

    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopAutoplay);
        heroCarousel.addEventListener('mouseleave', () => {
            if (autoplay) startAutoplay();
        });
        heroCarousel.addEventListener('focusin', stopAutoplay);
        heroCarousel.addEventListener('focusout', () => {
            if (autoplay) startAutoplay();
        });
    }

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('nav-open');
            nav.classList.toggle('nav-open');
            nav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
            menuToggle.innerHTML = isOpen ? '<i data-lucide="menu"></i>' : '<i data-lucide="x"></i>';
            initLucide();
        });

        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-open');
                nav.setAttribute('aria-hidden', 'true');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                initLucide();
            });
        });

        document.addEventListener('click', (e) => {
            if (header && !header.contains(e.target) && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                nav.setAttribute('aria-hidden', 'true');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                initLucide();
            }
        });
    }

    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            e.target.value = formatCep(e.target.value);
        });

        cepInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verificarCobertura(cepInput.value);
            }
        });
    }

    if (btnConsultar) {
        btnConsultar.addEventListener('click', () => {
            if (cepInput) verificarCobertura(cepInput.value);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'Escape' && nav && nav.classList.contains('nav-open')) {
            nav.classList.remove('nav-open');
            nav.setAttribute('aria-hidden', 'true');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
            }
            initLucide();
        }
    });

    updateCarousel(0);
    startAutoplay();
    initLucide();
});